import React from 'react';
import { Image } from 'react-native';

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
  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode={resizeMode}
      onLoadStart={onLoadStart}
      onLoadEnd={onLoadEnd}
      fadeDuration={fadeDuration}
    />
  );
};

export default ImageWithPlaceholder;
