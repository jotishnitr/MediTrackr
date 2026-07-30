import { useState } from "react";

export default function FeedbackForm({ isOpen, onClose }) {
    const [rating, setRating] = useState(5);
    const [category, setCategory] = useState("General");
    const [message, setMessage] = useState("");

    if (!isOpen) return null;

    const postFeedback = async () => {
        if (!rating || category === "" || message === "") {
            alert("Please fill all the fields");
            return;
        }
        const response = await fetch(`${import.meta.env.VITE_API_URL}/feedback`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                rating,
                category,
                message,
            }),
        });

        alert("Submitted successfully");
        onClose();
        setRating(5);
        setCategory("General");
        setMessage("");

    }

    const handleSubmit = (e) => {
        e.preventDefault();
        // Do nothing for now as requested
        console.log("Feedback submitted:", { rating, category, message });
        onClose();
    };

    return (
        <div className="feedback-modal-overlay">
            <div className="feedback-modal">
                <div className="feedback-modal-header">
                    <h2>Share Your Feedback</h2>
                    <button className="feedback-close-btn" onClick={onClose} aria-label="Close modal">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="feedback-form-body">
                    {/* Rating selector */}
                    <div className="feedback-field">
                        <label className="feedback-label">How would you rate your experience?</label>
                        <div className="feedback-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className={`star-btn ${star <= rating ? "active" : ""}`}
                                    onClick={() => setRating(star)}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category Selector */}
                    <div className="feedback-field">
                        <label className="feedback-label" htmlFor="feedback-category">Category</label>
                        <select
                            id="feedback-category"
                            className="feedback-select"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="General">General Feedback</option>
                            <option value="Bug">Report a Bug</option>
                            <option value="Feature">Feature Request</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Feedback Message */}
                    <div className="feedback-field">
                        <label className="feedback-label" htmlFor="feedback-message">Message</label>
                        <textarea
                            id="feedback-message"
                            className="feedback-textarea"
                            placeholder="Tell us what you think..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows="4"
                            required
                        ></textarea>
                    </div>

                    {/* Action buttons */}
                    <div className="feedback-actions">
                        <button type="button" className="feedback-cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="feedback-submit-btn" onClick={postFeedback}>
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
