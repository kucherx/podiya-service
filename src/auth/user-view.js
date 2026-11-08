export function publicInfo(user) {
  if (!user) {
    return { name: 'Відвідувач', email: '', phone: '', city: '', website: '' };
  }

  if (user.role === 'client') {
    return {
      name: user.client?.fullName || user.email,
      email: user.email,
      phone: user.client?.phone || '',
      city: user.client?.city || '',
      website: ''
    };
  }

  if (user.role === 'organizer') {
    return {
      name: user.organizer?.name || user.email,
      email: user.email,
      phone: user.organizer?.phone || '',
      city: user.organizer?.city || '',
      website: user.organizer?.website || ''
    };
  }

  return { name: 'Адміністратор', email: user.email, phone: '', city: '', website: '' };
}
