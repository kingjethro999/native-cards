import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

const demoProfiles = [
  {
    id: 1,
    name: 'Sarah Jones',
    age: 28,
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
    bio: 'Adventure seeker & coffee lover',
    zodiac: 'Libra',
    interests: ['Travel', 'Coffee', 'Yoga', 'Photography'],
    languages: ['English', 'Spanish', 'French'],
    location: 'New York City',
    height: "5'7\"",
  },
  {
    id: 2,
    name: 'Emma Wilson',
    age: 26,
    image: 'https://randomuser.me/api/portraits/women/3.jpg',
    bio: 'Foodie & yoga enthusiast',
    zodiac: 'Cancer',
    interests: ['Food', 'Yoga', 'Reading', 'Art'],
    languages: ['English', 'Italian'],
    location: 'San Francisco',
    height: "5'5\"",
  },
  {
    id: 3,
    name: 'Mike Smith',
    age: 32,
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
    bio: 'Photographer & traveler',
    zodiac: 'Taurus',
    interests: ['Photography', 'Hiking', 'Music', 'Cooking'],
    languages: ['English', 'German'],
    location: 'Denver',
    height: "6'0\"",
  },
];

const ProfileCard = ({ profile, onSwipe, onUndo, canUndo, index, totalCards }) => {
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(getCardScale(index));

  function getCardScale(idx) {
    return Math.max(0.9, 1 - 0.05 * idx);
  }

  const animatedStyle = useAnimatedStyle(() => {
    const rotation = (translateX.value / width) * 30;
    rotate.value = rotation;
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: index * 12 }, // Fixed stack offset
        { rotate: `${rotation}deg` },
        { scale: scale.value }
      ],
      opacity: index === 0 ? 1 : 0.8,
      zIndex: totalCards - index,
      position: 'absolute',
    };
  });

  return (
    <PanGestureHandler
      enabled={index === 0}
      activeOffsetX={[-20, 20]} // Only activate after 20px horizontal movement
      failOffsetY={[-20, 20]} // Fail gesture if vertical movement exceeds 20px
      onGestureEvent={(event) => {
        translateX.value = event.nativeEvent.translationX;
      }}
      onEnded={(event) => {
        const velocityX = event.nativeEvent.velocityX;
        if (Math.abs(translateX.value) > width * 0.25 || Math.abs(velocityX) > 800) {
          // Only allow left swipes
          if (translateX.value < 0) {
            translateX.value = withSpring(-width * 1.5, {
              velocity: velocityX,
              damping: 50,
              stiffness: 200,
            });
            onSwipe('left');
          } else {
            // If right swipe, return to center
            translateX.value = withSpring(0, {
              velocity: velocityX,
              damping: 50,
              stiffness: 200,
            });
          }
        } else {
          // Return to center
          translateX.value = withSpring(0, {
            damping: 50,
            stiffness: 200,
          });
        }
      }}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={styles.imageContainer}>
          {canUndo && index === 0 && (
            <TouchableOpacity style={styles.backButton} onPress={onUndo}>
              <Text style={styles.backButtonText}>↩</Text>
            </TouchableOpacity>
          )}
          <Image source={{ uri: profile.image }} style={styles.image} />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{profile.name}, {profile.age}</Text>
          <Text style={styles.bio}>{profile.bio}</Text>
          <View style={styles.badgesContainer}>
            {profile.interests.map((interest, index) => (
              <Text key={index} style={styles.badge}>{interest}</Text>
            ))}
          </View>
          <View style={styles.badgesContainer}>
            {profile.languages.map((lang, index) => (
              <Text key={index} style={[styles.badge, styles.languageBadge]}>{lang}</Text>
            ))}
          </View>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const TinderSwiper = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeHistory, setSwipeHistory] = useState([]);

  const handleSwipe = (direction) => {
    setSwipeHistory(prev => [...prev, { index: currentIndex, direction }]);
    setCurrentIndex(prev => prev + 1);
  };

  const handleUndo = () => {
    if (swipeHistory.length > 0) {
      const lastSwipe = swipeHistory[swipeHistory.length - 1];
      if (lastSwipe.direction === 'left') {
        setSwipeHistory(prev => prev.slice(0, -1));
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  const visibleProfiles = demoProfiles.slice(currentIndex, currentIndex + 3);
  const canUndo = swipeHistory.length > 0 && swipeHistory[swipeHistory.length - 1].direction === 'left';

  return (
    <View style={styles.container}>
      {visibleProfiles.length > 0 ? (
        visibleProfiles.map((profile, index) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onSwipe={handleSwipe}
            onUndo={handleUndo}
            canUndo={canUndo}
            index={index}
            totalCards={visibleProfiles.length}
          />
        ))
      ) : (
        <Text style={styles.noProfiles}>No more profiles</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: width * 0.9,
    height: height * 0.7,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 5,
    alignItems: 'center',
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: '70%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 24,
    color: '#ff6b6b',
  },
  infoContainer: {
    padding: 15,
    width: '100%',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  bio: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 8,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#ff6b6b',
    color: 'white',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 5,
    marginBottom: 5,
    fontSize: 14,
  },
  languageBadge: {
    backgroundColor: '#6b83ff',
  },
  noProfiles: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TinderSwiper;
