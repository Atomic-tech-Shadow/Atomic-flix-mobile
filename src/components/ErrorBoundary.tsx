import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/newColors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Met à jour l'état pour que le prochain rendu affiche l'UI de fallback
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log l'erreur pour le développement
    if (__DEV__) {
      console.error('🚨 ErrorBoundary caught an error:', error);
      console.error('📍 Error Info:', errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });

    // Appeler le callback d'erreur si fourni
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // UI de fallback personnalisée si fournie
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI de fallback par défaut
      return (
        <View style={styles.container}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="warning-outline" size={80} color={COLORS.text.error} />
            </View>

            <Text style={styles.title}>Oups ! Une erreur s'est produite</Text>
            <Text style={styles.subtitle}>
              ATOMIC FLIX a rencontré un problème inattendu.
            </Text>

            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={this.handleRetry}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={20} color="#ffffff" />
                <Text style={styles.retryButtonText}>Réessayer</Text>
              </TouchableOpacity>
            </View>

            {/* Détails de l'erreur en mode développement */}
            {__DEV__ && this.state.error && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>🐛 Détails de l'erreur (DEV):</Text>
                <Text style={styles.debugText}>{this.state.error.toString()}</Text>
                
                {this.state.errorInfo?.componentStack && (
                  <>
                    <Text style={styles.debugTitle}>📍 Stack trace:</Text>
                    <Text style={styles.debugText}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  </>
                )}
              </View>
            )}

            <View style={styles.helpContainer}>
              <Text style={styles.helpTitle}>💡 Conseils :</Text>
              <Text style={styles.helpText}>• Vérifiez votre connexion internet</Text>
              <Text style={styles.helpText}>• Fermez et rouvrez l'application</Text>
              <Text style={styles.helpText}>• Redémarrez votre appareil si le problème persiste</Text>
            </View>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 20,
    opacity: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  actionsContainer: {
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    // Contour néon pour bouton retry
    borderWidth: 2,
    borderColor: COLORS.border.glow,
    shadowColor: COLORS.badges.atomic,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  debugContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    width: '100%',
    maxHeight: 200,
  },
  debugTitle: {
    color: COLORS.text.accent,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  debugText: {
    color: COLORS.text.muted,
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 10,
  },
  helpContainer: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    width: '100%',
  },
  helpTitle: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  helpText: {
    color: COLORS.text.secondary,
    fontSize: 14,
    marginBottom: 5,
    lineHeight: 20,
  },
});

export default ErrorBoundary;