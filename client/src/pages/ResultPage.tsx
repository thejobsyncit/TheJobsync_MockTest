import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './ResultPage.module.css';
import { CheckCircle2, Star } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ResultPage() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    fetchAssessment();
  }, [candidateId]);

  const fetchAssessment = async () => {
    try {
      const res = await axios.get(`${API_URL}/assessments/${candidateId}`);
      if (res.data.assessment.status !== 'COMPLETED' && res.data.assessment.status !== 'TERMINATED') {
        navigate(`/test/${candidateId}`);
        return;
      }
      setAssessment(res.data.assessment);
      if (res.data.assessment.candidate_rating) {
        setFeedbackSubmitted(true);
      }
    } catch (err) {
      alert('Error fetching assessment result');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (rating === 0) {
      alert("Please select a star rating");
      return;
    }
    setSubmittingFeedback(true);
    try {
      await axios.post(`${API_URL}/assessments/${assessment.assessment_id}/candidate-feedback`, {
        rating,
        feedback
      });
      setFeedbackSubmitted(true);
    } catch (err) {
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!assessment) return null;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <CheckCircle2 size={56} color="var(--primary)" />
          </div>
          <h1 className={styles.title} style={{ color: assessment.status === 'TERMINATED' ? 'var(--danger)' : (assessment.score >= 25 ? '#10b981' : '') }}>
            {assessment.status === 'TERMINATED' 
              ? 'TEST TERMINATED' 
              : (assessment.score >= 25 ? 'CONGRATULATIONS!' : 'THANK YOU!')}
          </h1>
          <p className={styles.subtitle}>
            {assessment.status === 'TERMINATED' 
              ? 'Your assessment was terminated due to a violation of our testing policies.'
              : 'Your assessment has been submitted successfully.'}
          </p>
        </div>

        <div className={styles.infoSection}>
          <p><strong>Candidate ID:</strong> {candidateId}</p>
          <p><strong>Name:</strong> {assessment.candidate.full_name}</p>
          <p><strong>Role:</strong> {assessment.department} - {assessment.position}</p>
        </div>

        {assessment.status !== 'TERMINATED' && (
          <div className={styles.hrMessage} style={{ backgroundColor: assessment.score >= 25 ? '#ecfdf5' : 'var(--primary-light)', color: assessment.score >= 25 ? '#065f46' : 'var(--primary)' }}>
            {assessment.score >= 25 ? (
              <strong>You are eligible for the next round! Our HR team will contact you shortly regarding the next steps.</strong>
            ) : (
              "Thank you for taking the test. Our HR team will review your profile and get back to you."
            )}
          </div>
        )}

        <div className={styles.feedbackSection}>
          {feedbackSubmitted ? (
            <div className={styles.feedbackSuccess}>
              <CheckCircle2 size={32} color="#10b981" />
              <h3>Thank you for your feedback!</h3>
              <p>Your response helps us improve the assessment experience.</p>
            </div>
          ) : (
            <div className={styles.feedbackForm}>
              <h3>How was your test experience?</h3>
              <div className={styles.starContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={36}
                    className={`${styles.star} ${(hoverRating || rating) >= star ? styles.starFilled : ''}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  />
                ))}
              </div>
              <textarea
                className={styles.feedbackInput}
                placeholder="Tell us what you liked or how we can improve... (Optional)"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                maxLength={500}
                rows={3}
              />
              <button 
                className={styles.submitFeedbackBtn} 
                onClick={handleFeedbackSubmit}
                disabled={submittingFeedback || rating === 0}
              >
                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
