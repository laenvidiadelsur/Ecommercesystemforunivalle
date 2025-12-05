import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  List,
  Surface,
  Avatar,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { MainStackParamList } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/supabase';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants';

type ProfileScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Profile'>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout } = useAuth();

  // Fetch user profile
  const {
    data: profile,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => authService.getCurrentUser(),
    enabled: !!user,
  });

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleVendorDashboard = () => {
    navigation.navigate('VendorDashboard');
  };

  const handleMyProducts = () => {
    navigation.navigate('MyProducts');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay información de usuario disponible</Text>
        <Button mode="contained" onPress={() => navigation.navigate('Login')}>
          Iniciar Sesión
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Surface style={styles.header} elevation={2}>
        <View style={styles.profileHeader}>
          <Avatar.Text
            size={80}
            label={user.nombre?.charAt(0).toUpperCase() || 'U'}
            style={styles.avatar}
            color={COLORS.surface}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.nombre || 'Usuario'}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userId}>Carnet: {user.carnet}</Text>
          </View>
        </View>
        
        <Button
          mode="contained"
          onPress={handleEditProfile}
          style={styles.editButton}
          icon="pencil"
        >
          Editar Perfil
        </Button>
      </Surface>

      {/* Account Section */}
      <Card style={styles.section}>
        <Card.Title title="Cuenta" titleStyle={styles.sectionTitle} />
        <Card.Content>
          <List.Item
            title="Correo Institucional"
            description={user.email}
            left={(props) => <List.Icon {...props} icon="email" />}
            style={styles.listItem}
          />
          <List.Item
            title="Carnet Estudiantil"
            description={user.carnet}
            left={(props) => <List.Icon {...props} icon="card-account-details" />}
            style={styles.listItem}
          />
          <List.Item
            title="Teléfono"
            description={profile?.telefono || 'No registrado'}
            left={(props) => <List.Icon {...props} icon="phone" />}
            style={styles.listItem}
          />
          <List.Item
            title="Dirección"
            description={profile?.direccion || 'No registrada'}
            left={(props) => <List.Icon {...props} icon="map-marker" />}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      {/* Vendor Section */}
      {user.rol === 'vendedor' && (
        <Card style={styles.section}>
          <Card.Title title="Vendedor" titleStyle={styles.sectionTitle} />
          <Card.Content>
            <List.Item
              title="Panel de Control"
              description="Gestiona tu negocio"
              left={(props) => <List.Icon {...props} icon="store" />}
              onPress={handleVendorDashboard}
              style={styles.listItem}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
            <List.Item
              title="Mis Productos"
              description="Administra tus productos"
              left={(props) => <List.Icon {...props} icon="package" />}
              onPress={handleMyProducts}
              style={styles.listItem}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
            <List.Item
              title="Estadísticas"
              description="Ver rendimiento de ventas"
              left={(props) => <List.Icon {...props} icon="chart-bar" />}
              style={styles.listItem}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
          </Card.Content>
        </Card>
      )}

      {/* Settings Section */}
      <Card style={styles.section}>
        <Card.Title title="Configuración" titleStyle={styles.sectionTitle} />
        <Card.Content>
          <List.Item
            title="Cambiar Contraseña"
            description="Actualiza tu contraseña de acceso"
            left={(props) => <List.Icon {...props} icon="lock" />}
            onPress={handleChangePassword}
            style={styles.listItem}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
          <List.Item
            title="Notificaciones"
            description="Configura tus preferencias"
            left={(props) => <List.Icon {...props} icon="bell" />}
            style={styles.listItem}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
          <List.Item
            title="Privacidad"
            description="Gestiona tu privacidad"
            left={(props) => <List.Icon {...props} icon="shield-account" />}
            style={styles.listItem}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
        </Card.Content>
      </Card>

      {/* Support Section */}
      <Card style={styles.section}>
        <Card.Title title="Ayuda y Soporte" titleStyle={styles.sectionTitle} />
        <Card.Content>
          <List.Item
            title="Centro de Ayuda"
            description="Preguntas frecuentes y guías"
            left={(props) => <List.Icon {...props} icon="help-circle" />}
            onPress={() => navigation.navigate('HelpCenter')}
            style={styles.listItem}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
          <List.Item
            title="Contactar Soporte"
            description="¿Necesitas ayuda?"
            left={(props) => <List.Icon {...props} icon="face-agent" />}
            style={styles.listItem}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
          <List.Item
            title="Términos y Condiciones"
            description="Lee nuestros términos de servicio"
            left={(props) => <List.Icon {...props} icon="file-document" />}
            style={styles.listItem}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
        </Card.Content>
      </Card>

      {/* Logout Button */}
      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.logoutButton}
        textColor={COLORS.error}
        icon="logout"
      >
        Cerrar Sesión
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  header: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    backgroundColor: COLORS.primary,
    marginRight: SPACING.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  userId: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  editButton: {
    borderRadius: 8,
  },
  section: {
    margin: SPACING.md,
    marginTop: 0,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  listItem: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: 0,
  },
  logoutButton: {
    margin: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
    borderRadius: 8,
    borderColor: COLORS.error,
  },
});
