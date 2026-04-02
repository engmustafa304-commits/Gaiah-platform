const { db } = require('../config/firebase');

const checkInvitationLimit = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }
    
    const userData = userDoc.data();
    const subscription = userData.subscription;
    
    // التحقق من صلاحية الاشتراك
    if (subscription.expiresAt && subscription.expiresAt.toDate() < new Date()) {
      return res.status(403).json({ 
        error: '⚠️ اشتراكك منتهي. يرجى تجديد الاشتراك للاستمرار' 
      });
    }
    
    // التحقق من العدد المتبقي
    if (subscription.remainingInvitations <= 0 && subscription.plan !== 'enterprise') {
      return res.status(403).json({ 
        error: '⚠️ لا يوجد دعوات متبقية. يرجى ترقية اشتراكك',
        upgrade: true
      });
    }
    
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    return res.status(500).json({ error: 'حدث خطأ في التحقق من الاشتراك' });
  }
};

module.exports = { checkInvitationLimit };
