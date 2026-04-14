import User from "../models/User.js";

// 🔥 ALL USERS (except me)
export const getAllUsers = async (req, res) => {
  const { userId } = req.params;

  const currentUser = await User.findById(userId);

  const users = await User.find({ _id: { $ne: userId } })
    .select("name profileImage state district");

  const formatted = users.map(u => ({
    ...u._doc,
    isRequested: currentUser.sentRequests.includes(u._id),
    isConnected: currentUser.connections.includes(u._id)
  }));

  res.json(formatted);
};

// 🔥 SEND REQUEST
export const sendRequest = async (req, res) => {
  const { fromId, toId } = req.body;

  const sender = await User.findById(fromId);
  const receiver = await User.findById(toId);

  receiver.connectionRequests.push(fromId);
  sender.sentRequests.push(toId);

  await sender.save();
  await receiver.save();

  res.json({ message: "Request sent" });
};

// 🔥 ACCEPT REQUEST
export const acceptRequest = async (req, res) => {
  const { userId, requesterId } = req.body;

  const user = await User.findById(userId);
  const requester = await User.findById(requesterId);

  user.connections.push(requesterId);
  requester.connections.push(userId);

  user.connectionRequests.pull(requesterId);
  requester.sentRequests.pull(userId);

  await user.save();
  await requester.save();

  res.json({ message: "Connected" });
};

// 🔥 GET NETWORK DATA
export const getNetwork = async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId)
    .populate("connections", "name profileImage state district")
    .populate("connectionRequests", "name profileImage state district")
    .populate("sentRequests", "name profileImage state district");

res.json({
  connections: user.connections,
  requests: user.connectionRequests,
  sent: user.sentRequests
});
};

export const removeConnection = async (req, res) => {
  const { userId, connectionId } = req.body;

  const user = await User.findById(userId);
  const other = await User.findById(connectionId);

  user.connections.pull(connectionId);
  other.connections.pull(userId);

  await user.save();
  await other.save();

  res.json({ message: "Removed" });
};

export const removeRequest = async (req, res) => {
  try {
    const { userId, requesterId } = req.body;

    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);

    // 🔥 REMOVE REQUEST
    user.connectionRequests.pull(requesterId);

    // 🔥 ALSO REMOVE FROM sender side
    requester.sentRequests.pull(userId);

    await user.save();
    await requester.save();

    res.json({ message: "Request removed" });

  } catch (err) {
    console.log("REMOVE REQUEST ERROR:", err);
    res.status(500).json({ message: "Failed to remove request" });
  }
};