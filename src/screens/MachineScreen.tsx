import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../theme/colors';
import TelemetryCard from '../components/TelemetryCard';
import { useMachineStore } from '../stores/machineStore';

export default function MachineScreen({ navigation }: any) {
  const { selectedMachine, telemetry } = useMachineStore();
  const [streamUrl, setStreamUrl] = useState('https://nonalignable-loria-permissive.ngrok-free.dev/');
  const [inputUrl, setInputUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);

  const cleanUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      // Remove common tracking parameters
      urlObj.searchParams.delete('fbclid');
      urlObj.searchParams.delete('utm_source');
      urlObj.searchParams.delete('utm_medium');
      urlObj.searchParams.delete('utm_campaign');
      return urlObj.toString();
    } catch {
      return url;
    }
  };

  const getStreamSuggestions = (url: string) => {
    const cleanedUrl = cleanUrl(url);
    const baseUrl = cleanedUrl.split('?')[0].split('#')[0];
    
    return [
      { label: 'Direct stream', value: cleanedUrl },
      { label: '/stream', value: `${baseUrl}/stream` },
      { label: '/video', value: `${baseUrl}/video` },
      { label: '/mjpeg', value: `${baseUrl}/mjpeg` },
      { label: '/image', value: `${baseUrl}/image` },
    ];
  };

  const handleStreamError = () => {
    setVideoLoading(false);
    const suggestions = getStreamSuggestions(streamUrl);
    
    Alert.alert(
      'Stream Failed',
      'URL might not be a direct camera stream. Try these paths:',
      [
        ...suggestions.map((sug) => ({
          text: sug.label,
          onPress: () => {
            setStreamUrl(sug.value);
            setVideoLoading(true);
          }
        })),
        {
          text: 'Cancel',
          onPress: () => setStreamUrl(''),
        }
      ]
    );
  };

  const handleAddUrl = async () => {
    if (!inputUrl.trim()) return;
    
    setIsLoading(true);
    try {
      // Validate URL format
      const validUrl = new URL(inputUrl);
      const cleaned = cleanUrl(inputUrl);
      setStreamUrl(cleaned);
      setInputUrl('');
      setVideoLoading(true);
    } catch (error) {
      Alert.alert('Invalid URL', 'Please enter a valid camera stream URL (e.g., http://192.168.1.100:8080)');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearStream = () => {
    setStreamUrl('');
    setVideoLoading(false);
  };

  const isMjpegStream = /mjpeg|mjpg/i.test(streamUrl);
  const webviewHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; background: #000; }
        #player { width: 100%; height: 100vh; }
        img { width: 100%; height: 100%; object-fit: contain; }
      </style>
    </head>
    <body>
      <img id="player" src="${streamUrl}" onload="document.getElementById('status').innerText = 'Loaded'" onerror="document.getElementById('status').innerText = 'Error loading stream'">
      <div id="status" style="color: white; position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px;">Loading...</div>
      <script>
        // For MJPEG streams, refresh the image periodically
        setInterval(function() {
          var img = document.getElementById('player');
          img.src = '${streamUrl}?' + new Date().getTime();
        }, 500);
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.machineName}>{selectedMachine?.name ?? 'No Machine Selected'}</Text>
            <Text style={styles.machineStatus}>{selectedMachine?.isOnline ? 'Online' : 'Offline'}</Text>
          </View>
          <View style={{ flexDirection: 'row' }} />
        </View>

        {/* Camera / Stream */}
        <View style={styles.cameraContainer}>
          {streamUrl ? (
            <View style={styles.videoWrapper}>
              {videoLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Loading stream...</Text>
                </View>
              )}  
              <WebView
                source={isMjpegStream ? { html: webviewHtml } : { uri: streamUrl }}
                style={styles.video}
                scrollEnabled={true}
                nestedScrollEnabled={true}
                javaScriptEnabled
                domStorageEnabled
                originWhitelist={['*']}
                mixedContentMode="always"
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                onLoad={() => setVideoLoading(false)}
                onError={handleStreamError}
              />
            </View>
          ) : (
            <View style={styles.cameraPlaceholder}>
              <Text style={styles.cameraText}>Camera Feed Placeholder</Text>
              <View style={styles.urlInputContainer}>
                <TextInput
                  style={styles.urlInput}
                  placeholder="Enter camera stream URL"
                  placeholderTextColor={colors.mutedText}
                  value={inputUrl}
                  onChangeText={setInputUrl}
                  editable={!isLoading}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={[styles.addButton, isLoading && styles.addButtonDisabled]}
                  onPress={handleAddUrl}
                  disabled={isLoading}
                >
                  <Text style={styles.addButtonText}>{isLoading ? 'Loading...' : 'Add URL'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.helpText}>Supports: HTTP image streams, MJPEG, IP cameras</Text>
            </View>
          )}
        </View>

        {/* Telemetry */}
        <TelemetryCard telemetry={telemetry} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.creamBackground,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  machineName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  machineStatus: {
    fontSize: 14,
    color: colors.mutedText,
  },
  cameraContainer: {
    padding: 16,
    flex: 1,
  },
  videoWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    minHeight: 300,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },
  loadingText: {
    color: colors.cardWhite,
    marginTop: 8,
    fontSize: 12,
  },
  helpText: {
    color: colors.mutedText,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  cameraPlaceholder: {
    height: 400,
    borderRadius: 12,
    backgroundColor: '#00000008',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  cameraText: {
    color: colors.mutedText,
    fontSize: 16,
    marginBottom: 12,
  },
  urlInputContainer: {
    width: '100%',
    gap: 8,
  },
  urlInput: {
    backgroundColor: colors.cardWhite,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.primary,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: colors.cardWhite,
    fontWeight: '700',
    fontSize: 14,
  },
  smallButton: {
    backgroundColor: colors.cardWhite,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  smallButtonText: {
    color: colors.primary,
    fontWeight: '700',
  },
});