import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import ChatScreen from '../Screens/Chatting/ChattingScreen';
import LoginScreen from '../Screens/Login/LoginScreen';
import SignupScreen from '../Screens/Signup/SignupScreen';
import DashboardScreen from '../Screens/Dashboard/Dashboard';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { COLORS } from '../constants/colors';

const StackNavigation = () => {
    const Stack = createStackNavigator();
    const { isLoggedIn } = useSelector((state: RootState) => state.auth);

    return (
        <Stack.Navigator
            initialRouteName={isLoggedIn ? 'DashboardScreen' : 'Login'}
        >
            {!isLoggedIn ? (
                <>
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Signup"
                        component={SignupScreen}
                        options={{ headerShown: false }}
                    />
                </>
            ) : (
                <>
                    <Stack.Screen
                        name="DashboardScreen"
                        component={DashboardScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="ChattingScreen"
                        component={ChatScreen}
                        options={({ route }: any) => ({
                            headerShown: false,
                            title: route.params?.userName || 'Chat',
                            headerBackTitle: 'Back',
                            headerStyle: {
                                backgroundColor: COLORS.white,
                            },
                            headerTintColor: COLORS.black,
                        })}
                    />
                </>
            )}
        </Stack.Navigator>
    )
}

export default StackNavigation

const styles = StyleSheet.create({})
