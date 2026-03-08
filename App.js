import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  StatusBar, Animated, Dimensions, Alert, ActivityIndicator,
  ScrollView, Modal, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_CONVERTED = [
  { id: '1', title: 'Summer Vibes', duration: '3:42', size: '4.2 MB', date: 'Today' },
  { id: '2', title: 'Road Trip Mix', duration: '4:15', size: '5.1 MB', date: 'Yesterday' },
  { id: '3', title: 'Chill Session', duration: '2:58', size: '3.6 MB', date: 'Mar 5' },
  { id: '4', title: 'Evening Beats', duration: '5:20', size: '6.4 MB', date: 'Mar 3' },
];

const MOCK_BLUETOOTH = [
  { id: 'bt1', name: 'JBL Flip 6', type: 'Speaker', signal: 90, connected: false },
  { id: 'bt2', name: 'AirPods Pro', type: 'Earbuds', signal: 75, connected: false },
  { id: 'bt3', name: 'Sony WH-1000', type: 'Headphones', signal: 60, connected: false },
  { id: 'bt4', name: 'Bose SoundLink', type: 'Speaker', signal: 45, connected: false },
];

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = ['Convert', 'Player', 'Bluetooth'];

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [converting, setConverting] = useState(false);
  const [convertProgress, setConvertProgress] = useState(0);
  const [convertedFiles, setConvertedFiles] = useState(MOCK_CONVERTED);
  const [currentTrack, setCurrentTrack] = useState(MOCK_CONVERTED[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0.3);
  const [volume, setVolume] = useState(0.7);
  const [bluetoothDevices, setBluetoothDevices] = useState(MOCK_BLUETOOTH);
  const [scanning, setScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [showFileModal, setShowFileModal] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const tabIndicator = useRef(new Animated.Value(0)).current;

  // Pulse animation for playing state
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.timing(rotateAnim, { toValue: 1, duration: 8000, useNativeDriver: true })
      ).start();
    } else {
      pulseAnim.stopAnimation();
      rotateAnim.stopAnimation();
      Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
  }, [isPlaying]);

  // Tab indicator
  useEffect(() => {
    Animated.spring(tabIndicator, {
      toValue: activeTab * (width / 3),
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [activeTab]);

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  // ─── CONVERT ────────────────────────────────────────────────────────────────
  const startConvert = () => {
    setConverting(true);
    setConvertProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 12;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => {
          setConverting(false);
          const newFile = {
            id: Date.now().toString(),
            title: `New Track ${convertedFiles.length + 1}`,
            duration: '3:00',
            size: '3.8 MB',
            date: 'Just now',
          };
          setConvertedFiles(prev => [newFile, ...prev]);
          Alert.alert('✅ Done!', 'Video converted to MP3 successfully!');
        }, 500);
      }
      setConvertProgress(Math.min(p, 100));
    }, 200);
  };

  // ─── BLUETOOTH ──────────────────────────────────────────────────────────────
  const startScan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 3000);
  };

  const connectDevice = (device) => {
    if (connectedDevice?.id === device.id) {
      setConnectedDevice(null);
      setBluetoothDevices(prev =>
        prev.map(d => d.id === device.id ? { ...d, connected: false } : d)
      );
      return;
    }
    setBluetoothDevices(prev =>
      prev.map(d => ({ ...d, connected: d.id === device.id }))
    );
    setConnectedDevice(device);
    Alert.alert('🔵 Connected!', `Now playing through ${device.name}`);
  };

  // ─── RENDER CONVERT TAB ─────────────────────────────────────────────────────
  const renderConvert = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Upload Zone */}
      <TouchableOpacity onPress={() => setShowFileModal(true)} activeOpacity={0.85}>
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.uploadZone}>
          <View style={styles.uploadIconRing}>
            <Text style={styles.uploadIcon}>🎬</Text>
          </View>
          <Text style={styles.uploadTitle}>Select Video File</Text>
          <Text style={styles.uploadSub}>MP4 • MOV • AVI • MKV • WebM</Text>
          <View style={styles.uploadBadge}>
            <Text style={styles.uploadBadgeText}>TAP TO BROWSE</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Format Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>OUTPUT FORMAT</Text>
        <View style={styles.formatRow}>
          {['MP3', 'AAC', 'WAV', 'FLAC'].map((fmt, i) => (
            <TouchableOpacity key={fmt} style={[styles.formatChip, i === 0 && styles.formatChipActive]}>
              <Text style={[styles.formatChipText, i === 0 && styles.formatChipTextActive]}>{fmt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quality */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>QUALITY</Text>
        <View style={styles.qualityRow}>
          {['128 kbps', '192 kbps', '320 kbps'].map((q, i) => (
            <TouchableOpacity key={q} style={[styles.qualityChip, i === 2 && styles.qualityChipActive]}>
              <Text style={[styles.qualityText, i === 2 && styles.qualityTextActive]}>{q}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Convert Button */}
      {converting ? (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: `${convertProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>Converting... {Math.round(convertProgress)}%</Text>
        </View>
      ) : (
        <TouchableOpacity onPress={startConvert} activeOpacity={0.85}>
          <LinearGradient colors={['#e94560', '#c62a47']} style={styles.convertBtn}>
            <Text style={styles.convertBtnText}>⚡ CONVERT TO MP3</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Converted Files */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CONVERTED FILES ({convertedFiles.length})</Text>
        {convertedFiles.map(file => (
          <TouchableOpacity
            key={file.id}
            style={styles.fileCard}
            onPress={() => { setCurrentTrack(file); setActiveTab(1); }}
          >
            <View style={styles.fileIcon}>
              <Text style={{ fontSize: 20 }}>🎵</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fileName}>{file.title}</Text>
              <Text style={styles.fileMeta}>{file.duration} • {file.size}</Text>
            </View>
            <Text style={styles.fileDate}>{file.date}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  // ─── RENDER PLAYER TAB ──────────────────────────────────────────────────────
  const renderPlayer = () => (
    <View style={styles.playerContainer}>
      {/* Album Art */}
      <Animated.View style={[styles.albumArtWrapper, { transform: [{ scale: pulseAnim }] }]}>
        <Animated.View style={[styles.albumArt, { transform: [{ rotate: spin }] }]}>
          <LinearGradient colors={['#e94560', '#0f3460', '#533483']} style={styles.albumGradient}>
            <Text style={styles.albumEmoji}>🎵</Text>
          </LinearGradient>
        </Animated.View>
        {isPlaying && (
          <View style={styles.vinylRing} />
        )}
      </Animated.View>

      {/* Track Info */}
      <Text style={styles.trackTitle}>{currentTrack?.title}</Text>
      <Text style={styles.trackSub}>
        {connectedDevice ? `🔵 ${connectedDevice.name}` : '📱 Device Speaker'}
      </Text>

      {/* Progress Bar */}
      <View style={styles.seekBar}>
        <View style={[styles.seekFill, { width: `${progress * 100}%` }]} />
        <View style={[styles.seekThumb, { left: `${progress * 100}%` }]} />
      </View>
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>1:06</Text>
        <Text style={styles.timeText}>{currentTrack?.duration}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.ctrlBtn}>
          <Text style={styles.ctrlIcon}>⏮</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.playBtn}
          onPress={() => setIsPlaying(!isPlaying)}
          activeOpacity={0.85}
        >
          <LinearGradient colors={['#e94560', '#c62a47']} style={styles.playBtnGrad}>
            <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctrlBtn}>
          <Text style={styles.ctrlIcon}>⏭</Text>
        </TouchableOpacity>
      </View>

      {/* Volume */}
      <View style={styles.volumeRow}>
        <Text style={styles.volIcon}>🔈</Text>
        <View style={styles.volBar}>
          <View style={[styles.volFill, { width: `${volume * 100}%` }]} />
        </View>
        <Text style={styles.volIcon}>🔊</Text>
      </View>

      {/* Playlist Mini */}
      <FlatList
        data={convertedFiles}
        keyExtractor={i => i.id}
        style={styles.miniPlaylist}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.miniTrack, currentTrack?.id === item.id && styles.miniTrackActive]}
            onPress={() => setCurrentTrack(item)}
          >
            <Text style={styles.miniTrackIcon}>{currentTrack?.id === item.id ? '🎵' : '◦'}</Text>
            <Text style={[styles.miniTrackName, currentTrack?.id === item.id && { color: '#e94560' }]}>
              {item.title}
            </Text>
            <Text style={styles.miniTrackDur}>{item.duration}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  // ─── RENDER BLUETOOTH TAB ───────────────────────────────────────────────────
  const renderBluetooth = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* BT Header */}
      <LinearGradient colors={['#0f3460', '#16213e']} style={styles.btHeader}>
        <View style={styles.btIconRing}>
          <Text style={{ fontSize: 36 }}>📶</Text>
        </View>
        <Text style={styles.btTitle}>Bluetooth Audio</Text>
        <Text style={styles.btSub}>
          {connectedDevice ? `Connected: ${connectedDevice.name}` : 'No device connected'}
        </Text>
        <TouchableOpacity onPress={startScan} style={styles.scanBtn} activeOpacity={0.85}>
          <LinearGradient colors={['#e94560', '#c62a47']} style={styles.scanBtnGrad}>
            {scanning ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.scanBtnText}>🔍 SCAN FOR DEVICES</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      {/* Device List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AVAILABLE DEVICES</Text>
        {bluetoothDevices.map(device => (
          <TouchableOpacity
            key={device.id}
            style={[styles.btCard, device.connected && styles.btCardActive]}
            onPress={() => connectDevice(device)}
            activeOpacity={0.85}
          >
            <View style={styles.btDeviceIcon}>
              <Text style={{ fontSize: 22 }}>
                {device.type === 'Speaker' ? '🔊' : device.type === 'Earbuds' ? '🎧' : '🎧'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.btDeviceName}>{device.name}</Text>
              <Text style={styles.btDeviceType}>{device.type}</Text>
            </View>
            {/* Signal bars */}
            <View style={styles.signalBars}>
              {[30, 55, 80, 100].map((threshold, i) => (
                <View
                  key={i}
                  style={[
                    styles.signalBar,
                    { height: 6 + i * 4 },
                    device.signal >= threshold ? styles.signalBarActive : styles.signalBarInactive
                  ]}
                />
              ))}
            </View>
            <View style={[styles.connectStatus, device.connected && styles.connectStatusActive]}>
              <Text style={[styles.connectStatusText, device.connected && { color: '#fff' }]}>
                {device.connected ? 'CONNECTED' : 'CONNECT'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TIPS</Text>
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>💡 Make sure Bluetooth is enabled on your device</Text>
        </View>
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>💡 Keep devices within 10 meters for best quality</Text>
        </View>
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>💡 Tap a device to connect or disconnect</Text>
        </View>
      </View>
    </ScrollView>
  );

  // ─── FILE PICKER MODAL ──────────────────────────────────────────────────────
  const renderModal = () => (
    <Modal visible={showFileModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Select Source</Text>
          {['📁  File Manager', '🖼️  Gallery / Photos', '☁️  Cloud Storage', '🔗  Paste URL'].map(src => (
            <TouchableOpacity
              key={src}
              style={styles.modalItem}
              onPress={() => {
                setShowFileModal(false);
                Alert.alert('Selected', src.split('  ')[1]);
              }}
            >
              <Text style={styles.modalItemText}>{src}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.modalCancel} onPress={() => setShowFileModal(false)}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // ─── MAIN RENDER ────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />
      <LinearGradient colors={['#0a0a1a', '#0d0d2b']} style={{ flex: 1 }}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🎬 VideoToMP3</Text>
          {connectedDevice && (
            <View style={styles.btBadge}>
              <Text style={styles.btBadgeText}>🔵 {connectedDevice.name}</Text>
            </View>
          )}
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <Animated.View style={[styles.tabIndicator, { transform: [{ translateX: tabIndicator }] }]} />
          {TABS.map((tab, i) => (
            <TouchableOpacity key={tab} style={styles.tab} onPress={() => setActiveTab(i)}>
              <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }}>
          {activeTab === 0 && renderConvert()}
          {activeTab === 1 && renderPlayer()}
          {activeTab === 2 && renderBluetooth()}
        </View>

      </LinearGradient>
      {renderModal()}
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a1a' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 52, paddingBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  btBadge: { backgroundColor: '#0f3460', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  btBadgeText: { color: '#7eb8f7', fontSize: 12, fontWeight: '600' },

  // Tabs
  tabBar: {
    flexDirection: 'row', marginHorizontal: 16, backgroundColor: '#111130',
    borderRadius: 14, overflow: 'hidden', position: 'relative', marginBottom: 8,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', zIndex: 1 },
  tabText: { color: '#555580', fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#fff' },
  tabIndicator: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: width / 3 - 32 / 3,
    backgroundColor: '#e94560', borderRadius: 12,
    marginHorizontal: 3, marginVertical: 3,
  },

  // Section
  section: { marginVertical: 10 },
  sectionTitle: { color: '#555580', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 },

  // Upload Zone
  uploadZone: {
    borderRadius: 20, padding: 32, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#1a1a4a', borderStyle: 'dashed',
    marginBottom: 16,
  },
  uploadIconRing: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#1a1a4a',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  uploadIcon: { fontSize: 36 },
  uploadTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  uploadSub: { color: '#555580', fontSize: 13, marginBottom: 16 },
  uploadBadge: { backgroundColor: '#e94560', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  uploadBadgeText: { color: '#fff', fontWeight: '700', fontSize: 12, letterSpacing: 1 },

  // Format
  formatRow: { flexDirection: 'row', gap: 10 },
  formatChip: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10,
    backgroundColor: '#111130', borderWidth: 1, borderColor: '#222255',
  },
  formatChipActive: { backgroundColor: '#e94560', borderColor: '#e94560' },
  formatChipText: { color: '#555580', fontWeight: '700', fontSize: 13 },
  formatChipTextActive: { color: '#fff' },

  // Quality
  qualityRow: { flexDirection: 'row', gap: 10 },
  qualityChip: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
    backgroundColor: '#111130', borderWidth: 1, borderColor: '#222255',
  },
  qualityChipActive: { backgroundColor: '#0f3460', borderColor: '#3a7bd5' },
  qualityText: { color: '#555580', fontWeight: '600', fontSize: 12 },
  qualityTextActive: { color: '#7eb8f7' },

  // Convert button
  convertBtn: { borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginVertical: 16 },
  convertBtnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 1 },

  // Progress
  progressContainer: { marginVertical: 16 },
  progressBar: { height: 8, backgroundColor: '#111130', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#e94560', borderRadius: 4 },
  progressText: { color: '#888', textAlign: 'center', marginTop: 8, fontSize: 13 },

  // File card
  fileCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#111130',
    borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#1a1a3a',
  },
  fileIcon: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: '#1a1a4a',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  fileName: { color: '#fff', fontWeight: '600', fontSize: 14 },
  fileMeta: { color: '#555580', fontSize: 12, marginTop: 2 },
  fileDate: { color: '#333355', fontSize: 11 },

  // Player
  playerContainer: { flex: 1, alignItems: 'center', paddingTop: 10 },
  albumArtWrapper: { position: 'relative', marginBottom: 24 },
  albumArt: { width: 180, height: 180, borderRadius: 90, overflow: 'hidden', elevation: 20 },
  albumGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  albumEmoji: { fontSize: 64 },
  vinylRing: {
    position: 'absolute', top: -10, left: -10, right: -10, bottom: -10,
    borderRadius: 100, borderWidth: 2, borderColor: '#e9456040',
  },
  trackTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  trackSub: { color: '#555580', fontSize: 13, marginBottom: 20 },

  seekBar: {
    width: width - 64, height: 4, backgroundColor: '#1a1a3a',
    borderRadius: 2, position: 'relative', marginBottom: 6,
  },
  seekFill: { height: '100%', backgroundColor: '#e94560', borderRadius: 2 },
  seekThumb: {
    position: 'absolute', top: -6, width: 16, height: 16,
    borderRadius: 8, backgroundColor: '#e94560', marginLeft: -8,
  },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', width: width - 64, marginBottom: 24 },
  timeText: { color: '#555580', fontSize: 12 },

  controls: { flexDirection: 'row', alignItems: 'center', gap: 24, marginBottom: 28 },
  ctrlBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  ctrlIcon: { fontSize: 24, color: '#888' },
  playBtn: { elevation: 12 },
  playBtnGrad: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center' },
  playIcon: { fontSize: 28, color: '#fff' },

  volumeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, width: width - 64, marginBottom: 20 },
  volIcon: { fontSize: 18 },
  volBar: { flex: 1, height: 4, backgroundColor: '#1a1a3a', borderRadius: 2 },
  volFill: { height: '100%', backgroundColor: '#3a7bd5', borderRadius: 2 },

  miniPlaylist: { width: '100%' },
  miniTrack: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    paddingHorizontal: 16, borderRadius: 10, marginBottom: 4,
  },
  miniTrackActive: { backgroundColor: '#1a1a3a' },
  miniTrackIcon: { fontSize: 14, marginRight: 10, color: '#e94560' },
  miniTrackName: { flex: 1, color: '#888', fontSize: 13 },
  miniTrackDur: { color: '#333355', fontSize: 12 },

  // Bluetooth
  btHeader: { borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16 },
  btIconRing: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#1a3060',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  btTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  btSub: { color: '#7eb8f7', fontSize: 13, marginBottom: 16 },
  scanBtn: { borderRadius: 14 },
  scanBtnGrad: { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14 },
  scanBtnText: { color: '#fff', fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },

  btCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#111130',
    borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#1a1a3a',
  },
  btCardActive: { borderColor: '#3a7bd5', backgroundColor: '#0a1a3a' },
  btDeviceIcon: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: '#1a1a4a',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  btDeviceName: { color: '#fff', fontWeight: '700', fontSize: 14 },
  btDeviceType: { color: '#555580', fontSize: 12, marginTop: 2 },
  signalBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginRight: 12 },
  signalBar: { width: 5, borderRadius: 2 },
  signalBarActive: { backgroundColor: '#3a7bd5' },
  signalBarInactive: { backgroundColor: '#222255' },
  connectStatus: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: '#333366',
  },
  connectStatusActive: { backgroundColor: '#e94560', borderColor: '#e94560' },
  connectStatusText: { color: '#555580', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  // Tips
  tipCard: { backgroundColor: '#111130', borderRadius: 12, padding: 14, marginBottom: 8 },
  tipText: { color: '#555580', fontSize: 13 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#111130', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
  modalItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1a1a3a' },
  modalItemText: { color: '#fff', fontSize: 15 },
  modalCancel: { marginTop: 16, alignItems: 'center', paddingVertical: 12 },
  modalCancelText: { color: '#e94560', fontWeight: '700', fontSize: 15 },
});
