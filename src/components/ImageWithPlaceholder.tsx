import React, { useState, useRef, useEffect } from 'react';
import { Image, View, Text, Animated } from 'react-native';
import { COLORS } from '../constants/newColors';

interface ImageWithPlaceholderProps {
  uri: string;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  fadeDuration?: number;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
}

const ImageWithPlaceholder: React.FC<ImageWithPlaceholderProps> = ({
  uri,
  style,
  resizeMode = 'cover',
  fadeDuration = 200,
  onLoadStart,
  onLoadEnd,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animation de rotation continue
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    // Animation de pulsation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [spinValue, pulseValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // ❌ Validation : Si URI vide/null → afficher erreur claire
  if (!uri || uri.trim() === '') {
    console.warn('⚠️ ImageWithPlaceholder: URI vide ou invalide. URI reçue:', uri);
    return (
      <View style={[style, { backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#888', fontSize: 12 }}>Image non disponible</Text>
      </View>
    );
  }

  if (hasError) {
    console.warn('⚠️ ImageWithPlaceholder: Erreur lors du chargement de:', uri);
    return (
      <View style={[style, { backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#888', fontSize: 12 }}>Erreur image</Text>
      </View>
    );
  }

  return (
    <View style={[style, { width: style?.width || 120, height: style?.height || 180, position: 'relative' }]}>
      {/* Spinner d'animation pendant le chargement */}
      {isLoading && (
        <View style={{ position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 10 }}>
          <Animated.View
            style={[
              {
                width: 32,
                height: 32,
                borderWidth: 3,
                borderRadius: 50,
                borderColor: `${COLORS.secondary}30`,
                borderTopColor: COLORS.secondary,
              },
              {
                transform: [
                  { rotate: spin },
                  { scale: pulseValue },
                ],
              },
            ]}
          />
        </View>
      )}
      
      <Image
        source={{ uri }}
        style={[style, { width: style?.width || 120, height: style?.height || 180 }]}
        resizeMode={resizeMode}
        onLoadStart={() => {
          setIsLoading(true);
          onLoadStart?.();
        }}
        onLoadEnd={() => {
          setIsLoading(false);
          onLoadEnd?.();
        }}
        onError={() => {
          console.error('❌ ImageWithPlaceholder erreur chargement:', uri);
          setHasError(true);
          setIsLoading(false);
        }}
        fadeDuration={fadeDuration}
        progressiveRenderingEnabled={true}
      />
    </View>
  );
};

export default ImageWithPlaceholder;
