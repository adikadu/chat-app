const users = [];

export function addUser({ id, username, room }) {
  // Clean data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // validate data
  if (!username || !room) return { error: "Required fields not provided!" };

  // Check for existing user
  const existingUser = users.find(
    (user) => user.room === room && user.username === username
  );

  if (existingUser) return { error: "Username already exists!" };

  const user = { id, username, room };
  users.push(user);
  return { user };
}

export function removeUser(id) {
  const userIdx = users.findIndex((user) => user.id === id);

  if (userIdx === -1) return { error: "User does not exist!" };
  return { user: users.splice(userIdx, 1)[0] };
}

export function getUser(id) {
  return users.find((user) => user.id == id);
}

export function getUsersInRoom(room) {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
}
