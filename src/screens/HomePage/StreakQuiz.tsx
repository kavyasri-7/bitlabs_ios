import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { QuizQuestion, fetchStreakQuestions, completeStreak } from '../../services/streak/StreakService';

const { width: screenWidth } = Dimensions.get('window');

type StreakQuizProps = {
  onComplete: () => void;
  onSkip: () => void;
  userId: number | string;
};

export const StreakQuiz: React.FC<StreakQuizProps> = ({ onComplete, onSkip, userId }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Record of questionIndex -> selected option key
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [visible, setVisible] = useState(true);
  const [completing, setCompleting] = useState(false);

  // Derived: selected option for the current question
  const selectedOption = selectedAnswers[currentIndex] ?? null;

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const data = await fetchStreakQuestions();
      console.log('StreakQuiz component - Streak Questions Success:', data);
      setQuestions(data || []);
    } catch (error) {
      console.error('Failed to load quiz questions:', error);
      // Set empty array to allow quiz to show error state
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setVisible(false);
    onSkip();
  };

  const handleComplete = async () => {
    try {
      setCompleting(true);
      await completeStreak(userId);
      console.log('Streak completed successfully');
      setVisible(false);
      onComplete();
    } catch (error) {
      console.error('Failed to complete streak:', error);
      setVisible(false);
      onComplete();
    } finally {
      setCompleting(false);
    }
  };

  const handleOptionSelect = (optionKey: string) => {
    // Allow re-selection only if not yet answered for this question
    if (selectedAnswers[currentIndex]) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optionKey }));
  };

  // Calculate score from all answers
  const calculateScore = () => {
    let s = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) s++;
    });
    return s;
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowResult(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) return null;

  // ── Empty / error state ───────────────────────────────────────────────────
  if (questions.length === 0) {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={handleClose}>
        <View style={styles.modalOverlay}>
          <LinearGradient colors={['#FFF5E6', '#FFD580']} style={styles.card}>
            <View style={styles.resultContainer}>
              <Text style={styles.fireEmoji}>⚠️</Text>
              <Text style={styles.resultTitle}>No Quiz Available</Text>
              <Text style={styles.resultText}>
                Unable to load streak questions. Please try again later.
              </Text>
              <TouchableOpacity style={styles.completeButton} onPress={handleClose}>
                <Text style={styles.completeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    );
  }

  const currentQuestion = questions[currentIndex];
  const showCorrectness = selectedOption !== null;
  const isLastQuestion = currentIndex === questions.length - 1;
  const isFirstQuestion = currentIndex === 0;

  // ── Main quiz modal ───────────────────────────────────────────────────────
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <LinearGradient colors={['#FFF5E6', '#FFD580']} style={styles.card}>

          {showResult ? (
            /* ── Result screen ── */
            <View style={styles.resultContainer}>
              <Text style={styles.fireEmoji}>🏆</Text>
              <Text style={styles.resultTitle}>Quiz Completed!</Text>
              <Text style={styles.resultText}>
                You scored {calculateScore()} out of {questions.length}
              </Text>
              <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
                <Text style={styles.completeButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* ── Question screen ── */
            <>
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>Daily Streak Quiz</Text>
                  <Text style={styles.progress}>
                    Question {currentIndex + 1} of {questions.length}
                  </Text>
                </View>
                <TouchableOpacity onPress={handleClose}>
                  <Text style={styles.skipBtn}>Skip</Text>
                </TouchableOpacity>
              </View>

              {/* Question */}
              <Text style={styles.questionText}>{currentQuestion.question}</Text>

              {/* Options */}
              <View style={styles.optionsContainer}>
                {Object.entries(currentQuestion.options).map(([key, value]) => {
                  const isSelected = selectedOption === key;
                  const isCorrect = key === currentQuestion.correctAnswer;

                  return (
                    <TouchableOpacity
                      key={key}
                      disabled={showCorrectness}
                      onPress={() => handleOptionSelect(key)}
                      style={[
                        styles.optionButton,
                        isSelected && styles.selectedOption,
                        showCorrectness && isCorrect && styles.correctOption,
                        showCorrectness && isSelected && !isCorrect && styles.wrongOption,
                      ]}>
                      <Text
                        style={[
                          styles.optionText,
                          (isSelected || (showCorrectness && isCorrect)) && styles.whiteText,
                        ]}>
                        {key}. {value}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Answer explanation — always shown once an answer is selected, stays visible */}
              {showCorrectness && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionText}>
                    {currentQuestion.description}
                  </Text>
                </View>
              )}

              {/* Prev / Next navigation buttons */}
              <View style={styles.navRow}>
                {/* Prev button */}
                <TouchableOpacity
                  style={[
                    styles.navBtn,
                    styles.prevBtn,
                    isFirstQuestion && styles.navBtnDisabled,
                  ]}
                  onPress={handlePrev}
                  disabled={isFirstQuestion}>
                  <Text
                    style={[
                      styles.navBtnText,
                      styles.prevBtnText,
                      isFirstQuestion && styles.navBtnTextDisabled,
                    ]}>
                    ‹ Prev
                  </Text>
                </TouchableOpacity>

                {/* Next / Finish button */}
                <TouchableOpacity
                  style={[
                    styles.navBtn,
                    styles.nextBtn,
                    !selectedOption && styles.nextBtnDisabled,
                  ]}
                  onPress={handleNext}
                  disabled={!selectedOption}>
                  <Text style={[styles.navBtnText, styles.nextBtnText]}>
                    {isLastQuestion ? 'Finish ✓' : 'Next ›'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: wp('90%'),
    borderRadius: 20,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#4A2E0A',
  },
  progress: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#D4751A',
  },
  skipBtn: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#7A5830',
    opacity: 0.7,
  },

  /* ── Question ── */
  questionText: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#2F2F2F',
    marginBottom: 24,
    lineHeight: 26,
  },

  /* ── Options ── */
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  optionText: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#4A2E0A',
  },
  selectedOption: {
    backgroundColor: '#F46F16',
    borderColor: '#F46F16',
  },
  correctOption: {
    backgroundColor: '#27AE60',
    borderColor: '#27AE60',
  },
  wrongOption: {
    backgroundColor: '#E74C3C',
    borderColor: '#E74C3C',
  },
  whiteText: {
    color: '#FFFFFF',
  },

  /* ── Description / explanation ── */
  descriptionContainer: {
    marginTop: 16,
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#F46F16',
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Italic',
    color: '#5D4037',
    lineHeight: 20,
  },

  /* ── Prev / Next buttons ── */
  navRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  navBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevBtn: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1.5,
    borderColor: '#D4751A',
  },
  nextBtn: {
    backgroundColor: '#F46F16',
    elevation: 2,
  },
  nextBtnDisabled: {
    backgroundColor: '#F4B37B',
    elevation: 0,
  },
  navBtnDisabled: {
    borderColor: '#C8A882',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  navBtnText: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  prevBtnText: {
    color: '#7A5830',
  },
  nextBtnText: {
    color: '#FFFFFF',
  },
  navBtnTextDisabled: {
    color: '#B8956A',
  },

  /* ── Result screen ── */
  resultContainer: {
    alignItems: 'center',
    padding: 10,
  },
  fireEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#4A2E0A',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#7A5830',
    marginBottom: 30,
  },
  completeButton: {
    backgroundColor: '#F46F16',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 30,
    elevation: 3,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-Bold',
  },
});