import {
  getPublicInvitationByToken,
  submitPublicGuestRsvp,
  verifyPublicInvitationGuest,
} from '../shared/api.js';

const qs = (selector, root = document) => root.querySelector(selector);

const demoInvite = {
  event: {
    eventName: 'حفل زفاف محمد وفاطمة',
    eventType: 'زواج',
    eventDate: '2026-05-22',
    eventTime: '18:00',
    eventLocation: 'صالة الأحلام',
  },
  guestList: {
    listName: 'العائلة والأصدقاء',
    invitationTitle: 'دعوة زفاف',
    invitationText: 'يسرنا دعوتكم لحضور مناسبتنا ومشاركتنا فرحتنا.',
    media: {
      mediaType: 'image',
      mediaTitle: 'تصميم تجريبي',
      sampleUrl: '/images/designs/women1.jpg',
    },
  },
  demoGuests: [
    { guestName: 'أحمد محمد', whatsapp: '0500000000', invitationStatus: 'unknown' },
    { guestName: 'سارة عبدالله', whatsapp: '0500000001', invitationStatus: 'accepted' },
    { guestName: 'خالد علي', whatsapp: '0500000002', invitationStatus: 'declined' },
  ],
};

const stateEl = qs('#inviteState');
const contentEl = qs('#inviteContent');

let publicToken = '';
let invitationData = null;
let currentGuest = null;
let currentWhatsapp = '';
let currentPass = null;
let loading = false;
let errorMessage = '';
let demoMode = false;
let invitationCardSide = 'front';

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function normalizeWhatsapp(value = '') {
  return String(value).trim().replace(/\s+/g, '');
}

function formatDate(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function getPublicTokenFromUrl() {
  return new URLSearchParams(window.location.search).get('t') || '';
}

function setLoading(isLoading) {
  loading = isLoading;
}

function showMessage(message) {
  if (!stateEl) return;
  stateEl.innerHTML = `<div class="invite-alert">${escapeHtml(message)}</div>`;
  window.setTimeout(() => {
    if (stateEl) stateEl.innerHTML = '';
  }, 3200);
}

function getEventMetaMarkup() {
  const event = invitationData?.event || {};

  return `
    <dl class="invitation-event-meta">
      <div><dt>التاريخ</dt><dd>${formatDate(event.eventDate)}</dd></div>
      <div><dt>الوقت</dt><dd>${escapeHtml(event.eventTime || '-')}</dd></div>
      <div><dt>الموقع</dt><dd>${escapeHtml(event.eventLocation || '-')}</dd></div>
    </dl>
  `;
}

function getInvitationText() {
  const guestList = invitationData?.guestList || {};
  const design = guestList.invitationDesign || {};
  return guestList.invitationText
    || design.invitationText
    || 'يسرنا دعوتكم لحضور مناسبتنا.';
}

function getMediaInfo() {
  const guestList = invitationData?.guestList || {};
  const design = guestList.invitationDesign || {};
  const media = guestList.media || {};
  const finalMedia = design.finalMedia || {};
  const sampleUrl = finalMedia.publicUrl || design.selectedSampleUrl || media.sampleUrl || '';
  const mediaTitle = finalMedia.title || design.selectedSampleTitle || media.mediaTitle || 'تصميم الدعوة';
  const mediaType = finalMedia.mediaType || design.selectedSampleType || media.mediaType || 'image';
  return { sampleUrl, mediaTitle, mediaType };
}

function getInvitationMediaInfo() {
  const { sampleUrl, mediaType } = getMediaInfo();
  const normalizedType = String(mediaType || '').toLowerCase();
  const isVideo = normalizedType === 'video' || isVideoUrl(sampleUrl);
  const isImage = Boolean(sampleUrl) && !isVideo;

  return {
    mediaType: normalizedType || (isVideo ? 'video' : 'image'),
    imageUrl: isImage ? sampleUrl : '',
    isImage,
    isVideo,
  };
}

function isVideoUrl(url = '') {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

function getMediaMarkup() {
  const { sampleUrl, mediaTitle, mediaType } = getMediaInfo();
  if (sampleUrl && (mediaType === 'video' || isVideoUrl(sampleUrl))) {
    return `
      <figure class="invite-media">
        <video src="${escapeHtml(sampleUrl)}" controls playsinline></video>
      </figure>
    `;
  }

  if (sampleUrl) {
    return `
      <figure class="invite-media">
        <img src="${escapeHtml(sampleUrl)}" alt="${escapeHtml(mediaTitle)}" />
      </figure>
    `;
  }

  return `
    <div class="invite-media invite-media-placeholder">
      <span>${escapeHtml(mediaTitle)}</span>
    </div>
  `;
}

function renderShell(innerMarkup) {
  if (!contentEl) return;
  contentEl.innerHTML = innerMarkup;
}

function setView(viewName, options = {}) {
  if (viewName === 'verification') renderVerificationView();
  if (viewName === 'invitation') renderInvitationView();
  if (viewName === 'qr') renderQrView();
  if (viewName === 'declined') renderDeclinedView();
  if (viewName === 'not-found') renderNotFoundView();
  if (viewName === 'unavailable') renderUnavailableView(options.message);
}

function renderVerificationView() {
  renderShell(`
    <article class="invite-card verification-card">
      <h2>تحقق من دعوتك</h2>
      <p class="invite-muted">أدخل رقم الواتساب الذي استلمت عليه الدعوة.</p>
      <div class="verify-form">
        <label for="guestWhatsappInput">رقم الواتساب</label>
        <input id="guestWhatsappInput" type="tel" inputmode="tel" placeholder="05xxxxxxxx" autocomplete="tel" value="${escapeHtml(currentWhatsapp)}" />
        <button id="verifyGuestButton" class="invite-primary-button" type="button">${loading ? 'جار التحقق...' : 'عرض الدعوة'}</button>
      </div>
      <p class="invite-helper-note">استخدم نفس الرقم الموجود في قائمة الدعوة.</p>
    </article>
  `);

  const button = qs('#verifyGuestButton');
  if (button) button.disabled = loading;
  button?.addEventListener('click', verifyGuest);
  qs('#guestWhatsappInput')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') verifyGuest();
  });
}

async function verifyGuest() {
  const input = qs('#guestWhatsappInput');
  const whatsapp = normalizeWhatsapp(input?.value || '');

  if (!whatsapp) {
    showMessage('أدخل رقم الواتساب أولاً.');
    return;
  }

  currentWhatsapp = whatsapp;
  setLoading(true);
  renderVerificationView();

  try {
    if (demoMode) {
      setLoading(false);
      verifyDemoGuest(whatsapp);
      return;
    }

    const result = await verifyPublicInvitationGuest({ publicToken, whatsapp });
    setLoading(false);
    handleVerifyResult(result);
  } catch (error) {
    console.error('[invite] verify guest failed', {
      code: error?.code,
      message: error?.message,
      originalMessage: error?.originalMessage,
      details: error?.details,
    });

    setLoading(false);
    renderVerificationView();
    showMessage('تعذر التحقق من الدعوة. حاول مرة أخرى.');
  }
}

function verifyDemoGuest(whatsapp) {
  setLoading(false);
  const guest = demoInvite.demoGuests.find((item) => normalizeWhatsapp(item.whatsapp) === whatsapp);
  if (!guest) {
    currentGuest = null;
    currentPass = null;
    setView('not-found');
    return;
  }

  currentGuest = guest;
  currentPass = guest.invitationStatus === 'accepted'
    ? { qrStatus: 'active', qrPayload: 'gaiah://demo-pass' }
    : null;

  if (currentPass?.qrPayload) {
    setView('qr');
  } else if (guest.invitationStatus === 'declined') {
    setView('declined');
  } else {
    setView('invitation');
  }
}

function handleVerifyResult(result) {
  setLoading(false);
  if (!result?.matched) {
    currentGuest = null;
    currentPass = null;
    setView('not-found');
    return;
  }

  currentGuest = result.guest || null;
  currentPass = result.pass || null;
  invitationData = result.invitation || invitationData;

  if (currentPass?.qrPayload) {
    setView('qr');
  } else if (currentGuest?.invitationStatus === 'declined' || currentGuest?.rsvpStatus === 'declined') {
    setView('declined');
  } else {
    setView('invitation');
  }
}

function renderInvitationView() {
  invitationCardSide = 'front';
  renderShell(renderInvitationCard());
  attachInvitationCardActions();
}

function renderInvitationCard() {
  const guestName = currentGuest?.guestName || 'ضيفنا الكريم';
  const isSaving = loading === true;
  const hasPass = Boolean(currentPass?.qrPayload);
  const isAccepted = currentGuest?.invitationStatus === 'accepted' || currentGuest?.rsvpStatus === 'accepted' || hasPass;
  const shouldShowRsvpActions = !isAccepted || !hasPass;

  return `
    <article class="invite-card invitation-flip-card" data-card-side="${escapeHtml(invitationCardSide)}">
      ${hasPass ? `<button class="card-flip-icon" id="${invitationCardSide === 'front' ? 'showQrButton' : 'backToInvitationButton'}" type="button" aria-label="${invitationCardSide === 'front' ? 'Show QR' : 'Back to invitation'}">${invitationCardSide === 'front' ? 'QR' : 'دعوة'}</button>` : ''}
      <section class="invitation-card-face invitation-card-front" aria-hidden="${invitationCardSide === 'front' ? 'false' : 'true'}">
        <div class="invitation-card-heading">
          <h2>مرحباً ${escapeHtml(guestName)}</h2>
        </div>
        ${getMediaMarkup()}
        <p class="invitation-text">${escapeHtml(getInvitationText())}</p>
        ${getEventMetaMarkup()}
        <div class="invite-actions compact-actions">
          ${shouldShowRsvpActions ? `
            <button id="acceptInviteButton" class="invite-primary-button" type="button">${isSaving ? 'جار الحفظ...' : 'قبول الدعوة'}</button>
            <button id="declineInviteButton" class="invite-secondary-button" type="button">${isSaving ? 'جار الحفظ...' : 'الاعتذار'}</button>
          ` : ''}
        </div>
      </section>
      <section class="invitation-card-face invitation-card-back" aria-hidden="${invitationCardSide === 'back' ? 'false' : 'true'}">
        ${getPassMarkup()}
      </section>
    </article>
  `;
}

function attachInvitationCardActions() {
  const acceptButton = qs('#acceptInviteButton');
  const declineButton = qs('#declineInviteButton');
  const isSaving = loading === true;
  if (acceptButton) acceptButton.disabled = isSaving;
  if (declineButton) declineButton.disabled = isSaving;
  acceptButton?.addEventListener('click', acceptInvitation);
  declineButton?.addEventListener('click', declineInvitation);
  qs('#showQrButton')?.addEventListener('click', flipToBack);
  qs('#backToInvitationButton')?.addEventListener('click', flipToFront);
  qs('#downloadPassButton')?.addEventListener('click', downloadInvitationPass);
  qs('#reverifyGuestButton')?.addEventListener('click', () => setView('verification'));
}

function flipToFront() {
  invitationCardSide = 'front';
  renderShell(renderInvitationCard());
  attachInvitationCardActions();
}

function flipToBack() {
  invitationCardSide = 'back';
  renderShell(renderInvitationCard());
  attachInvitationCardActions();
  renderGuestQrCode();
}

async function submitDecision(decision) {
  if (!currentWhatsapp || (!publicToken && !demoMode)) {
    showMessage('تعذر حفظ الرد. حاول مرة أخرى.');
    return;
  }

  setLoading(true);
  renderInvitationView();

  try {
    let result;

    console.info('[invite] submit RSVP start', {
      decision,
      hasToken: Boolean(publicToken),
      hasWhatsapp: Boolean(currentWhatsapp),
    });

    if (demoMode) {
      result = {
        matched: true,
        decision,
        guest: {
          ...(currentGuest || {}),
          invitationStatus: decision,
          rsvpStatus: decision,
        },
        pass: decision === 'accepted'
          ? { qrStatus: 'active', qrPayload: 'gaiah://demo-pass' }
          : null,
      };
    } else {
      result = await submitPublicGuestRsvp({
        publicToken,
        whatsapp: currentWhatsapp,
        decision,
      });
    }

    console.info('[invite] submit RSVP result', result);

    if (!result?.matched) {
      currentGuest = null;
      currentPass = null;
      setLoading(false);
      setView('not-found');
      return;
    }

    currentGuest = result.guest || currentGuest;
    currentPass = result.pass || null;

    setLoading(false);

    if (decision === 'accepted') {
      setView('qr');
      showMessage('تم قبول الدعوة بنجاح.');
    } else {
      setView('declined');
      showMessage('تم تسجيل الاعتذار.');
    }
  } catch (error) {
    console.error('[invite] submit RSVP failed', {
      code: error?.code,
      message: error?.message,
      originalMessage: error?.originalMessage,
      details: error?.details,
    });

    setLoading(false);
    renderInvitationView();

    const friendlyMessage = error?.code === 'not-found'
      ? 'لم يتم العثور على الدعوة. تأكد من الرقم وحاول مرة أخرى.'
      : error?.code === 'failed-precondition'
        ? 'لا يمكن حفظ الرد حالياً. قد يكون الرابط معطلاً أو الدعوة غير متاحة.'
        : 'تعذر حفظ الرد. حاول مرة أخرى.';

    showMessage(friendlyMessage);
  }
}

function acceptInvitation() {
  submitDecision('accepted');
}

function declineInvitation() {
  submitDecision('declined');
}

function getPassMarkup() {
  const guestName = currentGuest?.guestName || 'ضيفنا الكريم';
  const event = invitationData?.event || {};
  const qrPayload = currentPass?.qrPayload || '';

  return `
    <div class="guest-pass-card">
      <h2>Attendance QR</h2>
      <p class="invite-muted">Show this QR at the venue entrance.</p>
      ${qrPayload ? renderQrCanvasMarkup() : ''}
      <div class="pass-details">
        <strong>${escapeHtml(guestName)}</strong>
        <span>${escapeHtml(event.eventName || '-')}</span>
        <span>${formatDate(event.eventDate)}</span>
      </div>
      ${qrPayload ? '' : '<p class="invite-helper-note pass-warning">Attendance QR is not available yet. Please verify again.</p>'}
      <div class="invite-actions compact-actions pass-actions">
        <button id="downloadPassButton" class="invite-secondary-button" type="button">تحميل بطاقة الحضور</button>
        ${qrPayload ? '' : '<button id="reverifyGuestButton" class="invite-primary-button" type="button">إعادة التحقق</button>'}
      </div>
    </div>
  `;
}

function renderQrCanvasMarkup() {
  return `
    <div class="real-qr-frame" aria-label="QR code">
      <canvas id="guestQrCanvas" class="guest-qr-canvas"></canvas>
    </div>
  `;
}

function getQrLibrary() {
  return window.QRCode || window.qrcode || null;
}

function showQrRenderError() {
  const frame = qs('.real-qr-frame');
  if (!frame) return;
  frame.innerHTML = `
    <div class="qr-render-error">
      Unable to display QR. Please refresh the page.
    </div>
  `;
}

function renderGuestQrCode() {
  const canvas = qs('#guestQrCanvas');
  const payload = currentPass?.qrPayload || '';
  if (!canvas || !payload) return;

  const qrLib = getQrLibrary();

  if (!qrLib?.toCanvas) {
    console.error('[invite] QRCode library is not available.', {
      hasWindowQRCode: Boolean(window.QRCode),
      hasWindowQrcode: Boolean(window.qrcode),
    });
    showQrRenderError();
    return;
  }

  qrLib.toCanvas(canvas, payload, {
    width: 220,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#123333',
      light: '#ffffff',
    },
  }, (error) => {
    if (error) {
      console.error('[invite] QR render failed', error);
      showQrRenderError();
    }
  });
}

function sanitizeFileName(value) {
  const safeName = String(value || '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return safeName || 'invitation-pass';
}

function buildDownloadFileName() {
  const eventName = invitationData?.event?.eventName || 'invitation-pass';
  return `${sanitizeFileName(eventName)}.png`;
}

function getQrCanvas() {
  return qs('#guestQrCanvas');
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

function downloadCanvasAsPng(canvas, fileName) {
  const triggerDownload = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (canvas.toBlob) {
    canvas.toBlob((blob) => {
      if (!blob) {
        triggerDownload(canvas.toDataURL('image/png'));
        return;
      }
      const url = URL.createObjectURL(blob);
      triggerDownload(url);
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
    return;
  }

  triggerDownload(canvas.toDataURL('image/png'));
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  let line = '';
  let cursorY = y;

  words.forEach((word, index) => {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = word;
      cursorY += lineHeight;
    } else {
      line = testLine;
    }

    if (index === words.length - 1 && line) {
      ctx.fillText(line, x, cursorY);
    }
  });

  return cursorY + lineHeight;
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawEventDetails(ctx, { x, y, width, compact = false } = {}) {
  const event = invitationData?.event || {};
  const guestName = currentGuest?.guestName || '';
  const details = [
    formatDate(event.eventDate),
    event.eventTime || '-',
    event.eventLocation || '-',
  ].filter(Boolean).join('   |   ');

  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#123333';
  ctx.font = compact ? '700 30px Arial, sans-serif' : '700 34px Arial, sans-serif';
  let cursorY = drawWrappedText(ctx, event.eventName || '-', x + width / 2, y, width, compact ? 38 : 44);

  if (guestName) {
    ctx.fillStyle = '#3a7a7a';
    ctx.font = compact ? '600 22px Arial, sans-serif' : '600 25px Arial, sans-serif';
    cursorY = drawWrappedText(ctx, guestName, x + width / 2, cursorY + 10, width, compact ? 32 : 36);
  }

  ctx.fillStyle = '#587070';
  ctx.font = compact ? '600 20px Arial, sans-serif' : '600 23px Arial, sans-serif';
  drawWrappedText(ctx, details, x + width / 2, cursorY + 14, width, compact ? 30 : 34);
  ctx.restore();
}

async function getQrCanvasForExport() {
  const existingCanvas = getQrCanvas();
  if (existingCanvas && existingCanvas.width && existingCanvas.height) {
    return existingCanvas;
  }

  const payload = currentPass?.qrPayload || '';
  const qrLib = getQrLibrary();
  if (!payload || !qrLib?.toCanvas) {
    throw new Error('QR canvas is not available.');
  }

  const canvas = document.createElement('canvas');
  await new Promise((resolve, reject) => {
    qrLib.toCanvas(canvas, payload, {
      width: 420,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#123333',
        light: '#ffffff',
      },
    }, (error) => (error ? reject(error) : resolve()));
  });
  return canvas;
}

async function buildImageInvitationPassCanvas() {
  const mediaInfo = getInvitationMediaInfo();
  const invitationImage = await loadImage(mediaInfo.imageUrl);
  const qrCanvas = await getQrCanvasForExport();
  const width = 1080;
  const margin = 56;
  const imageMaxHeight = 1480;
  const imageRatio = invitationImage.naturalWidth / invitationImage.naturalHeight;
  const imageWidth = width - margin * 2;
  const imageHeight = Math.min(imageWidth / imageRatio, imageMaxHeight);
  const qrSize = 300;
  const lowerHeight = 520;
  const height = Math.round(margin + imageHeight + 34 + lowerHeight + margin);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f7fbfb';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  drawRoundedRect(ctx, margin / 2, margin / 2, width - margin, height - margin, 34);
  ctx.fill();

  const imageX = margin;
  const imageY = margin;
  drawRoundedRect(ctx, imageX, imageY, imageWidth, imageHeight, 22);
  ctx.save();
  ctx.clip();
  ctx.drawImage(invitationImage, imageX, imageY, imageWidth, imageHeight);
  ctx.restore();
  ctx.strokeStyle = 'rgba(18, 51, 51, 0.16)';
  ctx.lineWidth = 2;
  ctx.stroke();

  const lowerY = imageY + imageHeight + 50;
  const qrX = (width - qrSize) / 2;
  ctx.drawImage(qrCanvas, qrX, lowerY, qrSize, qrSize);
  drawEventDetails(ctx, {
    x: margin + 20,
    y: lowerY + qrSize + 34,
    width: width - margin * 2 - 40,
  });

  return canvas;
}

async function buildQrOnlyPassCanvas() {
  const qrCanvas = await getQrCanvasForExport();
  const width = 960;
  const height = 1180;
  const margin = 74;
  const qrSize = 420;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f7fbfb';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  drawRoundedRect(ctx, margin / 2, margin / 2, width - margin, height - margin, 38);
  ctx.fill();

  drawEventDetails(ctx, {
    x: margin,
    y: 130,
    width: width - margin * 2,
    compact: true,
  });

  const qrX = (width - qrSize) / 2;
  ctx.drawImage(qrCanvas, qrX, 420, qrSize, qrSize);

  ctx.fillStyle = '#587070';
  ctx.font = '600 24px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Show this QR at the venue entrance.', width / 2, 900);

  return canvas;
}

async function downloadInvitationPass() {
  if (!currentPass?.qrPayload) {
    showMessage('Attendance pass is not available yet.');
    return;
  }

  try {
    const mediaInfo = getInvitationMediaInfo();
    let canvas;

    if (mediaInfo.isImage) {
      try {
        canvas = await buildImageInvitationPassCanvas();
      } catch (imageError) {
        console.error('[invite] image pass export failed, falling back to QR-only export', imageError);
        canvas = await buildQrOnlyPassCanvas();
      }
    } else {
      canvas = await buildQrOnlyPassCanvas();
    }

    downloadCanvasAsPng(canvas, buildDownloadFileName());
  } catch (error) {
    console.error('[invite] download pass failed', error);
    showMessage('Unable to download the invitation card. Please try again.');
  }
}

function renderQrView() {
  invitationCardSide = 'back';
  renderShell(renderInvitationCard());
  attachInvitationCardActions();
  renderGuestQrCode();
}

function renderDeclinedView() {
  renderShell(`
    <article class="invite-card declined-card">
      <h2>تم تسجيل الاعتذار</h2>
      <p class="invite-muted">يمكنك تغيير رأيك لاحقاً من نفس الرابط.</p>
      <button id="changeMindButton" class="invite-primary-button" type="button">تغيير القرار والقبول</button>
    </article>
  `);

  qs('#changeMindButton')?.addEventListener('click', () => setView('invitation'));
}

function renderNotFoundView() {
  currentGuest = null;
  currentPass = null;
  renderShell(`
    <article class="invite-card not-found-card">
      <h2>لم يتم العثور على الدعوة</h2>
      <p class="invite-muted">تأكد من إدخال رقم الواتساب الصحيح الذي استلمت عليه الدعوة.</p>
      <button id="tryAgainButton" class="invite-secondary-button" type="button">المحاولة مرة أخرى</button>
    </article>
  `);

  qs('#tryAgainButton')?.addEventListener('click', () => setView('verification'));
}

function renderUnavailableView(message = 'قد يكون الرابط غير مفعل أو لم يتم تجهيز الدعوة بعد.') {
  if (!contentEl) return;
  contentEl.innerHTML = `
    <article class="invite-card unavailable-card">
      <span class="invite-kicker">جيّة</span>
      <h1>الرابط غير متاح حالياً</h1>
      <p class="invite-muted">${escapeHtml(message)}</p>
    </article>
  `;
}

function renderLoadingView(message = 'جار تحميل الدعوة...') {
  if (contentEl) {
    contentEl.innerHTML = `<article class="invite-card loading-card">${escapeHtml(message)}</article>`;
  }
}

async function initInvitePage() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('preview') === 'unavailable') {
    setView('unavailable');
    return;
  }

  demoMode = params.get('demo') === '1';
  if (demoMode) {
    invitationData = {
      event: demoInvite.event,
      guestList: demoInvite.guestList,
      linkStatus: 'active',
    };
    setView('verification');
    return;
  }

  publicToken = getPublicTokenFromUrl();
  if (!publicToken) {
    setView('unavailable', { message: 'رابط الدعوة غير مكتمل أو غير صحيح.' });
    return;
  }

  renderLoadingView();
  try {
    const result = await getPublicInvitationByToken({ publicToken });
    invitationData = result.invitation || null;
    setView('verification');
  } catch (error) {
    errorMessage = 'رابط الدعوة غير متاح حالياً أو تم تعطيله.';
    setView('unavailable', { message: errorMessage });
  }
}

initInvitePage();
