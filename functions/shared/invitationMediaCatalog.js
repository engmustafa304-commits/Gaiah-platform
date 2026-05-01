const INVITATION_MEDIA_CATALOG = [
  {
    mediaId: "men1",
    mediaTitle: "تصميم رجالي 1",
    mediaType: "image",
    sampleUrl: "/images/designs/men1.jpg",
    fileName: "men1.jpg",
    category: "men",
    source: "sample_catalog",
    description: "نموذج تصميم رجالي لاختيار اتجاه التصميم.",
  },
  {
    mediaId: "men3",
    mediaTitle: "تصميم رجالي 3",
    mediaType: "image",
    sampleUrl: "/images/designs/men3.jpg",
    fileName: "men3.jpg",
    category: "men",
    source: "sample_catalog",
    description: "نموذج رجالي بطابع مختلف لاختيار اتجاه التصميم.",
  },
  {
    mediaId: "women1",
    mediaTitle: "تصميم نسائي 1",
    mediaType: "image",
    sampleUrl: "/images/designs/women1.jpg",
    fileName: "women1.jpg",
    category: "women",
    source: "sample_catalog",
    description: "نموذج تصميم نسائي لاختيار اتجاه التصميم.",
  },
  {
    mediaId: "women2",
    mediaTitle: "تصميم نسائي 2",
    mediaType: "image",
    sampleUrl: "/images/designs/women2.jpg",
    fileName: "women2.jpg",
    category: "women",
    source: "sample_catalog",
    description: "نموذج نسائي مناسب للمناسبات الاجتماعية.",
  },
  {
    mediaId: "women3",
    mediaTitle: "تصميم نسائي 3",
    mediaType: "image",
    sampleUrl: "/images/designs/women3.jpg",
    fileName: "women3.jpg",
    category: "women",
    source: "sample_catalog",
    description: "نموذج نسائي بطابع أنيق لاختيار اتجاه التصميم.",
  },
];

function getInvitationMediaById(mediaId) {
  return INVITATION_MEDIA_CATALOG.find((item) => item.mediaId === mediaId) || null;
}

function listInvitationMediaItems() {
  return INVITATION_MEDIA_CATALOG.map((item) => ({ ...item }));
}

module.exports = {
  INVITATION_MEDIA_CATALOG,
  getInvitationMediaById,
  listInvitationMediaItems,
};
