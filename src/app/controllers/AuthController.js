import jwt from 'jsonwebtoken';
import User from '../models/User';
import authConfig from '../../config/auth';
import Plan from '../models/Plan';

class AuthController {
  async store(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.activate) {
      return res.status(401).json({ error: 'User is not active' });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, name,is_admin } = user;
    const plan = await Plan.findByPk(user.plan_id);

    return res.json({
      user: {
        id,
        name,
        email,
        is_admin,
      },
      plan,
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new AuthController();
