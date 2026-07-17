const PushSubscription = require("../models/PushSubscription");

const subscribe = async (req, res) => {
  try {
    const subscription = req.body;

    const query = subscription.clientId
      ? { clientId: subscription.clientId }
      : { endpoint: subscription.endpoint };

    const savedSubscription = await PushSubscription.findOneAndUpdate(
      query,
      subscription,
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
