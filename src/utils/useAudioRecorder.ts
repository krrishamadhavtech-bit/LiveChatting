import { useRef, useState, useCallback } from 'react';
import AudioRecorderPlayer, {
    AudioEncoderAndroidType,
    AudioSourceAndroidType,
    AVEncoderAudioQualityIOSType,
    AVEncodingOption,
    type RecordBackType,
    type PlayBackType,
    type AudioSet,
} from 'react-native-audio-recorder-player';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import RNFS from 'react-native-fs';

const audioRecorderPlayer = new AudioRecorderPlayer();
const TEMP_PLAY_PATH = `${RNFS.CachesDirectoryPath}/temp_play_msg`;

export type PlayingState = {
    isPlaying: boolean;
    currentMs: number;
    durationMs: number;
    messageId: string | null;
};

const useAudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0); // ms
    const [playingState, setPlayingState] = useState<PlayingState>({
        isPlaying: false,
        currentMs: 0,
        durationMs: 0,
        messageId: null,
    });

    const recordingPath = useRef<string>('');

    // ─── Permissions ───────────────────────────────────────────────────────────
    const requestPermissions = async (): Promise<boolean> => {
        if (Platform.OS === 'android') {
            try {
                const grants = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                ]);
                const allGranted = Object.values(grants).every(
                    (r) => r === PermissionsAndroid.RESULTS.GRANTED,
                );
                if (!allGranted) {
                    Alert.alert(
                        'Permission Required',
                        'Microphone and storage permissions are required to send voice messages.',
                    );
                }
                return allGranted;
            } catch (err) {
                console.error('Permission error:', err);
                return false;
            }
        }
        return true;
    };

    // ─── Recording ─────────────────────────────────────────────────────────────
    const startRecording = useCallback(async (): Promise<boolean> => {
        const permitted = await requestPermissions();
        if (!permitted) return false;

        try {
            // Passing undefined lets the library use its default (safe) cache location
            // which avoids EROFS (Read-only file system) errors on Android.
            const path = undefined;

            const audioSet: AudioSet = {
                AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
                AudioSourceAndroid: AudioSourceAndroidType.MIC,
                AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
                AVNumberOfChannelsKeyIOS: 2,
                AVFormatIDKeyIOS: AVEncodingOption.aac,
            };

            const resultPath = await audioRecorderPlayer.startRecorder(path, audioSet);
            recordingPath.current = resultPath;
            setIsRecording(true);
            setRecordingDuration(0);

            audioRecorderPlayer.addRecordBackListener((e: RecordBackType) => {
                setRecordingDuration(e.currentPosition);
            });

            return true;
        } catch (err) {
            console.error('Start recording error:', err);
            Alert.alert('Error', 'Failed to start recording.');
            return false;
        }
    }, []);

    const stopRecording = useCallback(async (): Promise<{ path: string; duration: number } | null> => {
        try {
            let resultPath = await audioRecorderPlayer.stopRecorder();
            audioRecorderPlayer.removeRecordBackListener();

            // Store the path from the result or fallback to the one we got at start
            let finalPath = resultPath || recordingPath.current;

            // Robust path cleaning for Android: ensure it's a clean absolute path starting with /
            if (Platform.OS === 'android') {
                // Remove 'file://' and ensure the path starts with exactly one /
                finalPath = finalPath.replace(/^file:\/\//, '').replace(/^\/+/, '/');
            }

            console.log('✅ Recording stopped. Cleaned path:', finalPath);

            const duration = recordingDuration;
            setIsRecording(false);
            setRecordingDuration(0);
            return { path: finalPath, duration: Math.round(duration / 1000) };
        } catch (err) {
            console.error('Stop recording error:', err);
            setIsRecording(false);
            return null;
        }
    }, [recordingDuration]);

    // ─── Playback ──────────────────────────────────────────────────────────────
    const playAudio = useCallback(async (url: string, messageId: string) => {
        if (playingState.messageId === messageId && playingState.isPlaying) {
            try {
                await audioRecorderPlayer.pausePlayer();
                setPlayingState(prev => ({ ...prev, isPlaying: false }));
            } catch (err) {
                console.error('Pause error:', err);
            }
            return;
        }

        if (playingState.isPlaying || playingState.messageId !== null) {
            try {
                await audioRecorderPlayer.stopPlayer();
                audioRecorderPlayer.removePlayBackListener();
                // Clean up any temp file from a previous play
                try { await RNFS.unlink(TEMP_PLAY_PATH); } catch (_) { }
            } catch (_) { }
        }

        try {
            let playerPath = url;

            // ── HANDLE BASE64 DATA URI ──
            if (url.startsWith('data:')) {
                const base64Data = url.split('base64,')[1];
                if (base64Data) {
                    // Decide extension for the temp file. AAC/m4a is standard for our recording.
                    const extension = url.includes('audio/mp4') ? 'mp4' : 'm4a';
                    const fullTempPath = `${TEMP_PLAY_PATH}.${extension}`;

                    try {
                        await RNFS.writeFile(fullTempPath, base64Data, 'base64');
                        playerPath = (Platform.OS === 'android' ? 'file://' : '') + fullTempPath;
                    } catch (writeErr) {
                        console.error('Error writing base64 to temp file:', writeErr);
                        throw new Error('Failed to prepare audio data');
                    }
                }
            }

            console.log('▶️ Playing audio:', playerPath.slice(0, 50) + '...');
            await audioRecorderPlayer.startPlayer(playerPath);

            setPlayingState({
                isPlaying: true,
                currentMs: 0,
                durationMs: 0,
                messageId,
            });

            audioRecorderPlayer.addPlayBackListener((e: PlayBackType) => {
                if (e.currentPosition >= e.duration && e.duration > 0) {
                    audioRecorderPlayer.stopPlayer().catch(() => { });
                    audioRecorderPlayer.removePlayBackListener();
                    setPlayingState({ isPlaying: false, currentMs: 0, durationMs: 0, messageId: null });
                    // Attempt clean up
                    try {
                        const ext = url.includes('audio/mp4') ? 'mp4' : 'm4a';
                        RNFS.unlink(`${TEMP_PLAY_PATH}.${ext}`).catch(() => { });
                    } catch (_) { }
                } else {
                    setPlayingState({
                        isPlaying: true,
                        currentMs: e.currentPosition,
                        durationMs: e.duration,
                        messageId,
                    });
                }
            });
        } catch (err) {
            console.error('Play audio error:', err);
            setPlayingState({ isPlaying: false, currentMs: 0, durationMs: 0, messageId: null });
        }
    }, [playingState]);

    const stopPlayback = useCallback(async () => {
        try {
            await audioRecorderPlayer.stopPlayer();
            audioRecorderPlayer.removePlayBackListener();
            // Cleanup on explicit stop
            try {
                const ext = playingState.isPlaying ? 'm4a' : 'mp4'; // simple guess or we can search
                await RNFS.unlink(`${TEMP_PLAY_PATH}.m4a`).catch(() => { });
                await RNFS.unlink(`${TEMP_PLAY_PATH}.mp4`).catch(() => { });
            } catch (_) { }
        } catch (_) { }
        setPlayingState({ isPlaying: false, currentMs: 0, durationMs: 0, messageId: null });
    }, [playingState.isPlaying]);

    return {
        isRecording,
        recordingDuration,
        playingState,
        startRecording,
        stopRecording,
        playAudio,
        stopPlayback,
    };
};

export default useAudioRecorder;
