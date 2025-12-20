import React, { useState } from 'react';
import { Image, View, ActivityIndicator } from 'react-native';
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
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadStart = () => {
    setIsLoading(true);
    onLoadStart?.();
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    onLoadEnd?.();
  };

  return (
    <View style={[style, { overflow: 'hidden', position: 'relative' }]}>
      <Image
        source={{ uri }}
        style={style}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        fadeDuration={fadeDuration}
        progressiveRenderingEnabled={true}
      />
      {isLoading && (
        <View style={[style, { 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.2)'
        }]}>
          <ActivityIndicator size="small" color={COLORS.secondary} />
        </View>
      )}
    </View>
  );
};

export default ImageWithPlaceholder;
