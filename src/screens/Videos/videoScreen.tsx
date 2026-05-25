import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  memo,
  useContext,
} from "react";

import {
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
  Pressable,
  Animated,
  ImageBackground,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Platform,
} from "react-native";

import Video from "react-native-video";
import Icon from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as Keychain from "react-native-keychain";

import videoService from "@services/Videos/videoService";
import { showToast } from "@services/login/ToastService";
import UserContext from "@context/UserContext";

import { trackAnalyticsEvent } from "@services/Analytics/AnalyticsService";

const { getRecommendedVideos, trackVideoWatch } = videoService;

const PROGRESS_UPDATE_INTERVAL = 250;

const FAVICON_IMAGE = require("../../assests/Images/favicon.png");
const BG_IMAGE = require("../../assests/Images/backgrounds/image.png");
const SEARCH_PLACEHOLDER = require("../../assests/Images/Search/Search.png");

interface VideoItem {
  videoId: number;
  title: string;
  s3url: string;
  thumbnail_url: string;
  isWatched?: boolean;
  watched?: boolean;
  watchedStatus?: boolean;
}

const cleanUrl = (url?: string): string => {
  if (!url) return "";
  return url
    .replace(/\\r\\n/g, "")
    .replace(/\\r/g, "")
    .replace(/\\n/g, "")
    .replace(/[\r\n]/g, "")
    .replace(/%22/g, "")
    .trim()
    .replace(/ /g, "%20");
};

/* ===========================
   VIDEO CARD
=========================== */

const VideoCardItem = memo<{
  item: VideoItem;
  onPress: (url: string) => void;
}>(({ item, onPress }) => {
  const thumbnailSource = useMemo(() => {
    if (
      item?.thumbnail_url &&
      item.thumbnail_url.startsWith("http")
    ) {
      return { uri: cleanUrl(item.thumbnail_url) };
    }

    return FAVICON_IMAGE;
  }, [item?.thumbnail_url]);

  return (
    <View style={styles.card}>
      <Pressable onPress={() => onPress(cleanUrl(item.s3url))}>
        <Image
          source={thumbnailSource}
          style={styles.thumbnail}
          resizeMode="cover"
        />

        <View style={styles.playIconContainer}>
          <Icon name="play-circle" size={64} color="#F97316" />
        </View>
      </Pressable>

      <View style={styles.titleRow}>
        <Image
          style={styles.avatar}
          source={FAVICON_IMAGE}
          resizeMode="contain"
        />

        <Text numberOfLines={2} style={styles.caption}>
          {item.title}
        </Text>
      </View>
    </View>
  );
});

/* ===========================
   MAIN SCREEN
=========================== */

const VerifiedVideosScreen: React.FC<{
  navigation: any;
  route?: any;
}> = ({ navigation }) => {
  const { refreshScore } = useContext(UserContext);

  const [userId, setUserId] = useState<number | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [filtered, setFiltered] = useState<VideoItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");

  const [fsVisible, setFsVisible] = useState(false);

  const [paused, setPaused] = useState(true);

  const [muted, setMuted] = useState(false);

  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  const [duration, setDuration] = useState(0);

  const [currentTime, setCurrentTime] = useState(0);

  const [progress, setProgress] = useState<number>(0);

  const isSeekingRef = useRef(false);

  const currentTimeRef = useRef(0);

  const videoSource = useMemo(() => {
    return currentUrl ? { uri: currentUrl } : null;
  }, [currentUrl]);

  const videoRef = useRef<any>();

  const videoTrackedRef = useRef<string | null>(null);

  const fsScale = useRef(new Animated.Value(0.9)).current;

  const fsOpacity = useRef(new Animated.Value(0)).current;

  /* ===========================
     FETCH AUTH
  =========================== */

  useEffect(() => {
    const loadAuth = async () => {
      const userDetails = await Keychain.getGenericPassword({
        service: "userDetails",
      });

      const authToken = await Keychain.getGenericPassword({
        service: "authToken",
      });

      if (userDetails && authToken) {
        const parsed = JSON.parse(userDetails.password);

        setUserId(parsed.id);

        setUserToken(authToken.password);
      }
    };

    loadAuth();
  }, []);

  /* ===========================
     FETCH VIDEOS
  =========================== */

  useEffect(() => {
    const fetchVideos = async () => {
      if (!userId || !userToken) return;

      try {
        const result = await getRecommendedVideos(userId, userToken);

        const sorted = result.sort((a: any, b: any) => {
          const aWatched =
            a.isWatched || a.watched || a.watchedStatus;

          const bWatched =
            b.isWatched || b.watched || b.watchedStatus;

          return aWatched === bWatched ? 0 : aWatched ? 1 : -1;
        });

        setVideos(sorted);

        setFiltered(sorted);

        trackAnalyticsEvent("MOBILE-SHORTS", userId);
      } catch {
        showToast("error", "Failed to load videos");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [userId, userToken]);

  /* ===========================
     SEARCH
  =========================== */

  const handleSearch = (text: string) => {
    setSearchText(text);

    if (!text) {
      setFiltered(videos);
    } else {
      setFiltered(
        videos.filter((v) =>
          v.title.toLowerCase().includes(text.toLowerCase())
        )
      );
    }

    if (userId) {
      trackAnalyticsEvent("MOBILE-SHORTS", userId);
    }
  };

  /* ===========================
     OPEN VIDEO
  =========================== */

  const openVideo = (url: string) => {
    videoTrackedRef.current = null;

    setCurrentUrl(url);

    setPaused(false);

    setMuted(false);

    setFsVisible(true);

    if (userId) {
      trackAnalyticsEvent("MOBILE-SHORTS", userId);
    }

    Animated.parallel([
      Animated.timing(fsScale, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),

      Animated.timing(fsOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /* ===========================
     CLOSE VIDEO
  =========================== */

  const closeVideo = () => {
    setPaused(true);

    setTimeout(() => {
      setFsVisible(false);

      setCurrentUrl(null);

      setCurrentTime(0);

      setProgress(0);

      setDuration(0);
    }, 100);
  };

  /* ===========================
     TRACK WATCH
  =========================== */

  const handleProgress = (p: any) => {
    setCurrentTime(p.currentTime);

    if (!duration) return;

    const percent = (p.currentTime / duration) * 100;

    if (percent >= 70 && videoTrackedRef.current !== currentUrl) {
      videoTrackedRef.current = currentUrl;

      if (userId && userToken && currentUrl) {
        const matched = videos.find(
          (v) => v.s3url === currentUrl
        );

        if (matched) {
          trackVideoWatch(
            userId,
            matched.videoId,
            userToken
          );

          refreshScore?.();
        }
      }
    }
  };

  /* ===========================
     FORMAT TIME
  =========================== */

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || seconds < 0)
      return "0:00";

    const totalSeconds = Math.floor(seconds);

    const mins = Math.floor(totalSeconds / 60);

    const secs = totalSeconds % 60;

    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <ImageBackground
      source={BG_IMAGE}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator
              size="large"
              color="#F97316"
            />
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <View style={styles.headerRow}>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={styles.backButton}
                >
                  <Icon
                    name="arrow-back"
                    size={24}
                    color="#000"
                  />
                </TouchableOpacity>

                <Text style={styles.screenTitle}>
                  Tech Buzz Shorts
                </Text>

                <View style={styles.backButtonPlaceholder} />
              </View>
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons
                  name="search"
                  size={20}
                  color="#888"
                  style={styles.searchIcon}
                />

                <TextInput
                  style={styles.searchInput}
                  placeholder="Search Tech Buzz Shorts..."
                  placeholderTextColor="#888"
                  value={searchText}
                  onChangeText={handleSearch}
                />

                {searchText.length > 0 && (
                  <TouchableOpacity
                    onPress={() => handleSearch("")}
                    style={styles.clearButton}
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color="#888"
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <FlatList
              data={filtered}
              keyExtractor={(i) => `${i.videoId}`}
              renderItem={({ item }) => (
                <VideoCardItem
                  item={item}
                  onPress={openVideo}
                />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 40,
              }}
            />
          </>
        )}

        <Modal
          visible={fsVisible}
          transparent={false}
          animationType="fade"
          onRequestClose={closeVideo}
          statusBarTranslucent
        >
          <SafeAreaView
            style={{ flex: 1, backgroundColor: "#000" }}
          >
            <Animated.View
              style={{
                flex: 1,
                opacity: fsOpacity,
                transform: [{ scale: fsScale }],
              }}
            >
              {videoSource && (
                <Video
                  ref={videoRef}
                  source={videoSource}
                  style={{ flex: 1 }}
                  resizeMode="contain"
                  controls={true}
                  fullscreen={Platform.OS === "ios" ? fsVisible : false}
                  onFullscreenPlayerDidDismiss={
                    Platform.OS === "ios" ? closeVideo : undefined
                  }
                  progressUpdateInterval={
                    PROGRESS_UPDATE_INTERVAL
                  }
                  onLoad={(d) => {
                    setDuration(d.duration);
                  }}
                  onProgress={(x: any) => {
                    handleProgress(x);

                    if (isSeekingRef.current) return;

                    const time = Math.max(
                      0,
                      x.currentTime || 0
                    );

                    setCurrentTime(time);

                    setProgress(time);

                    currentTimeRef.current = time;
                  }}
                />
              )}

              <View style={[styles.fsControls, { top: 70 }]}>
                <TouchableOpacity
                  onPress={closeVideo}
                  style={styles.fsCloseBtn}
                >
                  <Icon
                    name="arrow-back"
                    size={28}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>


            </Animated.View>
          </SafeAreaView>
        </Modal>
      </View>
    </ImageBackground>
  );
};

export default VerifiedVideosScreen;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    padding: 4,
  },

  backButtonPlaceholder: {
    width: 32,
  },

  screenTitle: {
    fontSize: 18,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#000",
    flex: 1,
    textAlign: "center",
  },

  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#000",
  },

  clearButton: {
    padding: 4,
    marginLeft: 4,
  },

  card: {
    width: "92%",
    alignSelf: "center",
    marginVertical: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
  },

  thumbnail: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#E5E7EB",
  },

  playIconContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [
      { translateX: -32 },
      { translateY: -32 },
    ],
  },

  titleRow: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    resizeMode: "contain",
    backgroundColor: "#fff",
  },

  caption: {
    marginLeft: 12,
    flex: 1,
    fontSize: 15,
    color: "#000",
    fontWeight: "700",
  },

  fsControls: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  fsCloseBtn: {
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
  },

  timeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  bottomSlider: {
    position: "absolute",
    bottom: 55,
    width: "95%",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    height: 50,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
  },
});