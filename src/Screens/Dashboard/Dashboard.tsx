// Dashboard.tsx
import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { styles } from './Dashboard.style';
import ViewModal from './Dashboard.ViewModal';
import { COLORS } from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomModal from '../../components/CustomModal';

const DashboardScreen = () => {
  const {
    searchQuery,
    setSearchQuery,
    filteredUsers,
    renderUserItem,
    handleLogout,
    loading,
    currentUser,
    logoutModalVisible,
    setLogoutModalVisible,
    confirmLogout
  } = ViewModal();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh - in real app, you might refetch data
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading users...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Hello {currentUser ? `${currentUser.name}!` : ''}
        </Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
          {/* <Icon name="log-out-outline" size={18} color={COLORS.white} /> */}
          <Text style={[styles.headerButtonText, { marginLeft: 5 }]}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={20} color={COLORS.textTertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor={COLORS.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && Platform.OS !== 'ios' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color={COLORS.textTertiary} style={styles.clearText} />
          </TouchableOpacity>
        )}
      </View>

      {/* User Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
          {searchQuery ? ` for "${searchQuery}"` : ''}
        </Text>
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="people-outline" size={80} color={COLORS.disabled} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No users found' : 'No users available'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search' : 'Users will appear here'}
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <CustomModal
        visible={logoutModalVisible}
        title="Logout"
        message="Are you sure you want to logout?"
        onConfirm={confirmLogout}
        onCancel={() => setLogoutModalVisible(false)}
        confirmText="Logout"
      />
    </SafeAreaView>
  );
};

export default DashboardScreen;