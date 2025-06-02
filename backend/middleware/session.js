import Session from '../models/Session.js';

const sessionAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const session = await Session.findOne({ 
      token,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).populate('userId');

    if (!session) {
      throw new Error();
    }

    req.session = session;
    req.user = session.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate with a valid session' });
  }
};

export default sessionAuth; 