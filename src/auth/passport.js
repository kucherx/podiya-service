import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { AppDataSource } from '../db/data-source.js';
import { comparePassword } from './passwords.js';

passport.use(new LocalStrategy(
  { usernameField: 'email', passwordField: 'password' },
  async (email, password, done) => {
    try {
      const user = await AppDataSource.getRepository('User').findOne({
        where: { email: email.trim().toLowerCase() },
        relations: { client: true, organizer: true }
      });

      if (!user || !(await comparePassword(password, user.passwordHash))) {
        return done(null, false, { message: 'Невірний email або пароль.' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await AppDataSource.getRepository('User').findOne({
      where: { id },
      relations: { client: true, organizer: true }
    });
    done(null, user || false);
  } catch (error) {
    done(error);
  }
});

export default passport;
