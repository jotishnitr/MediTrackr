const PushSubscription = require("../models/PushSubscription");

const subscribe = async (req, res) => {
  try {
    const subscriptionData = {
      ...req.body,
      userId: req.user.id
    };

    const query = subscriptionData.clientId
      ? { clientId: subscriptionData.clientId }
      : { endpoint: subscriptionData.endpoint };

    const savedSubscription = await PushSubscription.findOneAndUpdate(
      query,
      subscriptionData,
      {
        upsert: true,
        new: true,
      },
    );

    res.status(200).json(savedSubscription);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = subscribe;
