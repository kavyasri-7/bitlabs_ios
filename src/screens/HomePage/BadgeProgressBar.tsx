import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

type BadgeProgressBarProps = {
  dashboardScore: number;
  backgroundColor?: string;
  borderColor?: string;
  scoreDetails?: any;
};

const BadgeProgressBar: React.FC<BadgeProgressBarProps> = ({
  dashboardScore,
  backgroundColor = '#fff',
  borderColor = '#EA7B20',
  scoreDetails,
}) => {
  const [isPointsModalOpen, setIsPointsModalOpen] = React.useState(false);
  const getPoints = (badge: string) => {
    return scoreDetails?.badgeScores?.find((b: any) => b.badge === badge)?.points;
  };

  const bronzeScore = getPoints('BRONZE') || 200;
  const silverScore = getPoints('SILVER') || 300;
  const goldScore = getPoints('GOLD') || 500;

  const bronzeWidth = (bronzeScore / goldScore) * 100;
  const silverWidth = ((silverScore - bronzeScore) / goldScore) * 100;
  const goldWidth = ((goldScore - silverScore) / goldScore) * 100;

  const badgeLevels = [
    { name: 'Bronze', score: bronzeScore },
    { name: 'Silver', score: silverScore },
    { name: 'Gold', score: goldScore },
  ];

  const earnedBadges = badgeLevels.filter(level => dashboardScore >= level.score);
  const nextBadge = badgeLevels.find(level => dashboardScore < level.score);

  // Determine which segment is active based on score
  const getActiveSegment = () => {
    if (dashboardScore < bronzeScore) return 'bronze';
    if (dashboardScore < silverScore) return 'silver';
    if (dashboardScore < goldScore) return 'gold';
    return 'gold'; // Max level
  };

  const activeSegment = getActiveSegment();

  const [parentWidth, setParentWidth] = React.useState(0);
  const [badgeWidth, setBadgeWidth] = React.useState(0);

  const onParentLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setParentWidth(width);
  };

  const onBadgeLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setBadgeWidth(width);
  };

  // Use web version's exact calculation method
  const overallProgress = Math.min(100, (dashboardScore / goldScore) * 100);

  // Calculate relative positions in pixels if widths are available
  let badgeLeft = 0;
  let pointerLeft = 0;

  if (parentWidth > 0 && badgeWidth > 0) {
    const progressRatio = Math.min(1, dashboardScore / goldScore);
    const progressX = progressRatio * parentWidth;

    // Safety margin to keep pointer away from the badge's rounded corners
    const pointerSafeMargin = 12;

    // Allow the badge to hang off the bar slightly (into card margins)
    // Card padding is wp(3%) + wrapper padding wp(1%) = wp(4%) total.
    // We allow up to wp(3.5%) to be safe.
    const allowableOverflow = wp('3.5%');

    // 1. Initial attempt: center badge on progressX
    let idealBadgeX = progressX - (badgeWidth / 2);

    // 2. Clamp badgeX to stay within card bounds (relatively to barContainer)
    let clampedBadgeX = Math.max(-allowableOverflow, Math.min(parentWidth + allowableOverflow - badgeWidth, idealBadgeX));

    // 3. See where the pointer would land relative to this badge position
    let targetPointerX = progressX - clampedBadgeX;

    // 4. Clamp the pointer within the badge's safe zone
    const clampedPointerX = Math.max(pointerSafeMargin, Math.min(badgeWidth - pointerSafeMargin, targetPointerX));

    // 5. Re-center badge if pointer was forced to move
    badgeLeft = progressX - clampedPointerX;
    pointerLeft = clampedPointerX;
  } else {
    // Fallback while measurements are loading or not available
    badgeLeft = overallProgress;
  }

  return (
    <View style={[styles.card, { backgroundColor, borderColor }]}>
      <View style={styles.wrapper}>
        <View style={styles.progressTextContainer}>
          <View style={styles.progressHeaderLeft}>
            <Text style={styles.progressLabel}>Badge Achievement Level</Text>
            <TouchableOpacity onPress={() => setIsPointsModalOpen(true)}>
              <Text style={styles.learnMoreText}>Learn More</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.progressPercentage}>{Math.round(overallProgress)}%</Text>
        </View>

        <View style={styles.barContainer} onLayout={onParentLayout}>
          <View style={styles.badgeBar}>
            {/* Bronze Segment */}
            <View
              style={[
                styles.segment,
                {
                  width: `${bronzeWidth}%`,
                  backgroundColor: 'transparent',
                }
              ]}
            >
              <Text style={styles.segmentText}>
                Bronze
              </Text>
            </View>

            {/* Silver Segment */}
            <View
              style={[
                styles.segment,
                {
                  width: `${silverWidth}%`,
                  backgroundColor: 'transparent',
                }
              ]}
            >
              <Text style={styles.segmentText}>
                Silver
              </Text>
            </View>

            {/* Gold Segment */}
            <View
              style={[
                styles.segment,
                styles.lastSegment,
                {
                  width: `${goldWidth}%`,
                  backgroundColor: 'transparent',
                }
              ]}
            >
              <Text style={styles.segmentText}>
                Gold
              </Text>
            </View>

            {/* Progress Fill - fills up to current score position */}
            <View
              style={[
                styles.progressFill,
                {
                  width: `${overallProgress}%`,
                },
              ]}
            />
          </View>

          {/* Score Badge - positioned below the bar with upward pointer, moves according to progress */}
          {parentWidth > 0 && (
            <View
              onLayout={onBadgeLayout}
              style={[
                styles.scoreBadge,
                {
                  left: badgeLeft,
                },
              ]}
            >
              {/* Upward pointing triangle */}
              <View style={[styles.badgePointer, { left: pointerLeft }]} />
              <Text style={styles.scoreBadgeText}>
                {dashboardScore} / {nextBadge ? nextBadge.score : goldScore}
              </Text>
            </View>
          )}
        </View>

        {!nextBadge && (
          <Text style={styles.congratsText}>Congrats Buddy! You unlocked all badges!</Text>
        )}
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isPointsModalOpen}
        onRequestClose={() => setIsPointsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>How do points work?</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsPointsModalOpen(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Subtitle */}
            <Text style={styles.modalSubtitle}>
              You can earn points by taking one of the actions below.
            </Text>

            {/* List */}
            <View style={styles.modalList}>
              {/* Card 1: Conquer The Challenge */}
              <View style={styles.modalCard}>
                <View style={styles.modalCardLeft}>
                  <View style={[styles.iconWrap, { backgroundColor: '#FFF5E6' }]}>
                    <Text style={styles.iconText}>🏆</Text>
                  </View>
                  <View style={styles.modalDetails}>
                    <Text style={styles.cardTitle}>Conquer The Challenge</Text>
                    <Text style={styles.cardSub}>Hackathon Submission</Text>
                  </View>
                </View>
                <Text style={styles.cardValue}>+25 Points</Text>
              </View>

              {/* Card 2: Prove Your Expertise */}
              <View style={styles.modalCard}>
                <View style={styles.modalCardLeft}>
                  <View style={[styles.iconWrap, { backgroundColor: '#FFF0F5' }]}>
                    <Text style={styles.iconText}>🧠</Text>
                  </View>
                  <View style={styles.modalDetails}>
                    <Text style={styles.cardTitle}>Prove Your Expertise</Text>
                    <Text style={styles.cardSub}>Skill Validation Test</Text>
                  </View>
                </View>
                <Text style={styles.cardValue}>+20 Points</Text>
              </View>

              {/* Card 3: Ignite Your Journey */}
              <View style={styles.modalCard}>
                <View style={styles.modalCardLeft}>
                  <View style={[styles.iconWrap, { backgroundColor: '#E6F7FF' }]}>
                    <Text style={styles.iconText}>🚀</Text>
                  </View>
                  <View style={styles.modalDetails}>
                    <Text style={styles.cardTitle}>Ignite Your Journey</Text>
                    <Text style={styles.cardSub}>Hackathon Registration</Text>
                  </View>
                </View>
                <Text style={styles.cardValue}>+5 Points</Text>
              </View>

              {/* Card 4: Link With Leaders */}
              <View style={styles.modalCard}>
                <View style={styles.modalCardLeft}>
                  <View style={[styles.iconWrap, { backgroundColor: '#F6FFED' }]}>
                    <Text style={styles.iconText}>🤝</Text>
                  </View>
                  <View style={styles.modalDetails}>
                    <Text style={styles.cardTitle}>Link With Leaders</Text>
                    <Text style={styles.cardSub}>Mentor Connect Registration</Text>
                  </View>
                </View>
                <Text style={styles.cardValue}>+5 Points</Text>
              </View>

              {/* Card 5: Catch The Vibe */}
              <View style={styles.modalCard}>
                <View style={styles.modalCardLeft}>
                  <View style={[styles.iconWrap, { backgroundColor: '#FFF7E6' }]}>
                    <Text style={styles.iconText}>📺</Text>
                  </View>
                  <View style={styles.modalDetails}>
                    <Text style={styles.cardTitle}>Catch The Vibe</Text>
                    <Text style={styles.cardSub}>Watching Tech Buzz Shorts</Text>
                  </View>
                </View>
                <Text style={styles.cardValue}>+2 Points</Text>
              </View>
            </View>

            {/* Footer */}
            <TouchableOpacity
              style={styles.gotItButton}
              onPress={() => setIsPointsModalOpen(false)}
            >
              <Text style={styles.gotItText}>Got It!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default BadgeProgressBar;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 12,
    padding: wp('3%'),
    marginVertical: hp('1%'),
    borderWidth: 1,
    elevation: 3,
    overflow: 'visible', // Allow badge to extend below, but position will keep it within horizontal bounds
  },
  wrapper: {
    paddingHorizontal: wp('1%'),
    overflow: 'visible',
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  progressLabel: {
    fontSize: hp('2%'),
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#000',
  },
  progressPercentage: {
    fontSize: hp('1.8%'),
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#EA7B20',
  },
  barContainer: {
    position: 'relative',
    marginBottom: hp('5%'), // More space for score badge below
    marginTop: hp('0.5%'),
    paddingHorizontal: 0,
    overflow: 'visible', // Allow badge to be visible below bar
  },
  badgeBar: {
    flexDirection: 'row',
    height: hp('4%'),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e66a0e', // Black border
    overflow: 'hidden',
    backgroundColor: '#fff',
    position: 'relative',
  },
  segment: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderRightColor: '#dcdcdc', // Black border in middle
    zIndex: 3, // Above progress fill
  },
  lastSegment: {
    borderRightWidth: 0, // Remove right border from last segment
  },
  segmentText: {
    fontSize: hp('1.3%'),
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#000', // Always black text
    zIndex: 5, // Ensure text is always visible above fill
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#EA7B20',
    borderRadius: 8,
    zIndex: 1,
  },
  scoreBadge: {
    position: 'absolute',
    bottom: -hp('4%'), // Moved further down
    backgroundColor: '#EA7B20',
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('0.6%'),
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
    alignItems: 'center',
    // Width is now dynamic
  },
  badgePointer: {
    position: 'absolute',
    top: -hp('0.6%'), // Deep overlap for perfect fusion (triangle height is ~0.8%)
    marginLeft: -hp('0.8%'),
    width: 0,
    height: 0,
    borderLeftWidth: hp('0.8%'),
    borderRightWidth: hp('0.8%'),
    borderBottomWidth: hp('0.8%'),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#EA7B20',
    zIndex: 11,
  },
  scoreBadgeText: {
    fontSize: hp('1.4%'),
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#fff', // White text on orange background
  },
  congratsText: {
    fontSize: hp('1.5%'),
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#28a745',
    textAlign: 'center',
    marginTop: hp('0.5%'),
  },
  progressHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  learnMoreText: {
    fontSize: hp('1.4%'),
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#EA7B20',
    marginLeft: wp('2%'),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: wp('90%'),
    backgroundColor: '#FFF9F2',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EA7B20',
  },
  modalHeader: {
    backgroundColor: '#EA7B20',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('5%'),
  },
  modalTitle: {
    fontSize: hp('2.2%'),
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#FFF',
  },
  closeButton: {
    backgroundColor: '#FFF',
    width: 26,
    height: 26,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: hp('1.6%'),
    color: '#555',
    fontFamily: 'PlusJakartaSans-Medium',
    textAlign: 'center',
    marginVertical: hp('2%'),
    paddingHorizontal: wp('5%'),
  },
  modalList: {
    paddingHorizontal: wp('4%'),
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: wp('3.5%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1.2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  modalCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  iconText: {
    fontSize: 18,
  },
  modalDetails: {
    flex: 1,
  },
  cardTitle: {
    fontSize: hp('1.6%'),
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#1A1A1A',
  },
  cardSub: {
    fontSize: hp('1.3%'),
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#666',
    marginTop: 2,
  },
  cardValue: {
    fontSize: hp('1.6%'),
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  gotItButton: {
    backgroundColor: '#EA7B20',
    borderRadius: 24,
    paddingVertical: hp('1.6%'),
    marginHorizontal: wp('5%'),
    marginBottom: hp('2.5%'),
    marginTop: hp('1.5%'),
    alignItems: 'center',
  },
  gotItText: {
    fontSize: hp('1.8%'),
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#FFF',
  },
});

