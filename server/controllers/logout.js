const logout = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    return res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    }).status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during logout",
    });
  }
};

module.exports = logout;
