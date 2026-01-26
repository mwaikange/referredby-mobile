import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, Bug, Lightbulb, HelpCircle } from "lucide-react";
import { api } from "@/lib/api";

type FeedbackType = 'issue' | 'feature' | 'general';

export default function FeedbackPage() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const feedbackTypes = [
    { type: 'issue' as FeedbackType, label: 'Report Issue', icon: Bug, description: 'Something is not working' },
    { type: 'feature' as FeedbackType, label: 'Suggest Feature', icon: Lightbulb, description: 'New idea or improvement' },
    { type: 'general' as FeedbackType, label: 'General Feedback', icon: HelpCircle, description: 'Other comments' },
  ];

  const handleSubmit = async () => {
    if (!subject.trim()) {
      setError('Please enter a subject');
      return;
    }
    if (!message.trim()) {
      setError('Please enter your message');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const profile = await api.getProfile();
      const result = await api.submitFeedback(profile.id, feedbackType, subject, message);
      
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.message || 'Failed to submit feedback');
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center font-sans min-h-[50vh] px-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-center mb-2">Thank You!</h2>
          <p className="text-gray-600 text-center mb-6">
            Your feedback has been submitted successfully. We appreciate you taking the time to help us improve.
          </p>
          <Button 
            onClick={() => setLocation('/profile')}
            className="bg-[#00736e] hover:bg-[#005a56] text-white rounded-lg"
            data-testid="button-back-to-profile"
          >
            Back to Profile
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 flex flex-col font-sans">
        <h1 className="text-center font-bold uppercase mb-6 tracking-tight text-[20px]">
          SEND FEEDBACK
        </h1>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Help us improve ReferredBy by sharing your feedback. Select a category below:
          </p>

          <div className="grid grid-cols-3 gap-2 mb-6">
            {feedbackTypes.map((item) => (
              <button
                key={item.type}
                onClick={() => setFeedbackType(item.type)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  feedbackType === item.type 
                    ? 'border-[#00736e] bg-[#00736e]/10' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                data-testid={`button-feedback-type-${item.type}`}
              >
                <item.icon className={`w-5 h-5 mx-auto mb-1 ${
                  feedbackType === item.type ? 'text-[#00736e]' : 'text-gray-500'
                }`} />
                <p className={`text-xs font-medium ${
                  feedbackType === item.type ? 'text-[#00736e]' : 'text-gray-700'
                }`}>{item.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of your feedback"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00736e] focus:border-transparent"
              data-testid="input-feedback-subject"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please provide details about your feedback, issue, or suggestion..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00736e] focus:border-transparent resize-none"
              data-testid="input-feedback-message"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4" data-testid="text-feedback-error">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-12 bg-[#00736e] hover:bg-[#005a56] text-white font-bold rounded-lg"
            data-testid="button-submit-feedback"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              'SUBMIT FEEDBACK'
            )}
          </Button>

          <Button
            onClick={() => setLocation('/profile')}
            variant="outline"
            className="w-full h-12 bg-[#C41E3A] hover:bg-[#a31830] text-white font-bold rounded-lg border-0"
            data-testid="button-back"
          >
            BACK
          </Button>
        </div>
      </div>
    </Layout>
  );
}
