export const sanitizeUser = <T extends { passwordHash?: string }>(
  user: T,
): Omit<T, "passwordHash"> => {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
};

export const toMemberResponse = (user: {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl ?? undefined,
});

export const toCardResponse = (card: {
  id: string;
  listId: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  position: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: card.id,
  listId: card.listId,
  title: card.title,
  description: card.description ?? undefined,
  dueDate: card.dueDate?.toISOString(),
  position: card.position,
  status: card.status,
  createdAt: card.createdAt,
  updatedAt: card.updatedAt,
});
