import React, { useState } from 'react';
import { Image, View, Text } from 'react-native';

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
    <Image
      source={{ uri }}
      style={style}
      resizeMode={resizeMode}
      onLoadStart={onLoadStart}
      onLoadEnd={onLoadEnd}
      onError={() => {
        console.error('❌ ImageWithPlaceholder erreur chargement:', uri);
        setHasError(true);
      }}
      fadeDuration={fadeDuration}
      progressiveRenderingEnabled={true}
    />
  );
};

export default ImageWithPlaceholder;
