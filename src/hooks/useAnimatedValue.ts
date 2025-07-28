import { useRef, useCallback } from 'react';
import { Animated } from 'react-native';

/**
 * 🔥 Hook pour animations fluides avec native driver
 * Optimise les performances en utilisant le thread natif
 */
export const useAnimatedValue = (initialValue: number = 0) => {
  const animatedValue = useRef(new Animated.Value(initialValue)).current;

  const animateTo = useCallback((
    toValue: number, 
    duration: number = 300,
    useNativeDriver: boolean = true
  ) => {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      useNativeDriver,
    });
  }, [animatedValue]);

  const animateSpring = useCallback((
    toValue: number,
    friction: number = 4,
    tension: number = 100,
    useNativeDriver: boolean = true
  ) => {
    return Animated.spring(animatedValue, {
      toValue,
      friction,
      tension,
      useNativeDriver,
    });
  }, [animatedValue]);

  const setValue = useCallback((value: number) => {
    animatedValue.setValue(value);
  }, [animatedValue]);

  return {
    animatedValue,
    animateTo,
    animateSpring,
    setValue,
  };
};

/**
 * 🔥 Hook pour animations de scale optimisées
 */
export const useScaleAnimation = (initialScale: number = 1) => {
  const { animatedValue, animateTo, animateSpring, setValue } = useAnimatedValue(initialScale);

  const scaleIn = useCallback((duration: number = 150) => {
    return animateTo(0.98, duration);
  }, [animateTo]);

  const scaleOut = useCallback((duration: number = 150) => {
    return animateSpring(1);
  }, [animateSpring]);

  const resetScale = useCallback(() => {
    setValue(1);
  }, [setValue]);

  return {
    scaleValue: animatedValue,
    scaleIn,
    scaleOut,
    resetScale,
  };
};

/**
 * 🔥 Hook pour animations d'opacité optimisées
 */
export const useOpacityAnimation = (initialOpacity: number = 1) => {
  const { animatedValue, animateTo, setValue } = useAnimatedValue(initialOpacity);

  const fadeIn = useCallback((duration: number = 300) => {
    return animateTo(1, duration);
  }, [animateTo]);

  const fadeOut = useCallback((duration: number = 300) => {
    return animateTo(0, duration);
  }, [animateTo]);

  const setOpacity = useCallback((opacity: number) => {
    setValue(opacity);
  }, [setValue]);

  return {
    opacityValue: animatedValue,
    fadeIn,
    fadeOut,
    setOpacity,
  };
};