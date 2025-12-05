import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Text,
  Chip,
  Button,
  ActivityIndicator,
  Surface,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { RootStackParamList, Order } from '../../types';
import { ordersService } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants';

type OrdersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderDetail'>;

const ORDER_STATUS_COLORS: Record<Order['estado'], string> = {
  pendiente: COLORS.warning,
  confirmada: COLORS.info,
  enviada: COLORS.info,
  entregada: COLORS.success,
  cancelada: COLORS.error,
};

const ORDER_STATUS_LABELS: Record<Order['estado'], string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  enviada: 'Enviada',
  entregada: 'Entregada',
  cancelada: 'Cancelada',
};

export default function OrdersScreen() {
  const navigation = useNavigation<OrdersScreenNavigationProp>();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch orders
  const {
    data: orders = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => ordersService.getOrders(),
    enabled: !!user,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleOrderPress = (order: Order) => {
    navigation.navigate('OrderDetail', { orderId: order.id });
  };

  const getStatusColor = (status: string) => {
    return ORDER_STATUS_COLORS[status as keyof typeof ORDER_STATUS_COLORS] || COLORS.textSecondary;
  };

  const getStatusLabel = (status: string) => {
    return ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS] || status;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity onPress={() => handleOrderPress(item)}>
      <Card style={styles.orderCard}>
        <Card.Content>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderId}>Pedido #{item.id.slice(-6)}</Text>
              <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
            </View>
            <Chip
              mode="flat"
              style={[
                styles.statusChip,
                { backgroundColor: getStatusColor(item.estado) + '20' },
              ]}
              textStyle={[
                styles.statusText,
                { color: getStatusColor(item.estado) },
              ]}
            >
              {getStatusLabel(item.estado)}
            </Chip>
          </View>

          <View style={styles.orderDetails}>
            <Text style={styles.itemsCount}>
              {item.items.length} producto{item.items.length !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.totalAmount}>
              Total: Bs. {item.total.toLocaleString()}
            </Text>
          </View>

          <View style={styles.orderActions}>
            <Button
              mode="text"
              onPress={() => handleOrderPress(item)}
              style={styles.detailsButton}
            >
              Ver Detalles
            </Button>
            {item.estado === 'pendiente' && (
              <Button
                mode="outlined"
                onPress={() => {/* Handle cancel order */}}
                style={styles.cancelButton}
                textColor={COLORS.error}
              >
                Cancelar
              </Button>
            )}
            {item.estado === 'entregada' && (
              <Button
                mode="text"
                onPress={() => {/* Handle reorder */}}
                style={styles.reorderButton}
              >
                Reordenar
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Text style={styles.headerTitle}>Mis Pedidos</Text>
        <Text style={styles.headerSubtitle}>
          {orders.length} pedido{orders.length !== 1 ? 's' : ''}
        </Text>
      </Surface>

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ordersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No tienes pedidos</Text>
            <Text style={styles.emptyText}>
              Tus pedidos aparecerán aquí cuando hagas tu primera compra
            </Text>
            <Button
              mode="contained"
              onPress={() => (navigation as any).getParent()?.navigate('CatalogTab')}
              style={styles.emptyButton}
            >
              Explorar Productos
            </Button>
          </View>
        }
      />
    </View>
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
  header: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  ordersList: {
    padding: SPACING.md,
  },
  orderCard: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  orderId: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  orderDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  statusChip: {
    borderRadius: 16,
    paddingHorizontal: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  itemsCount: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  totalAmount: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    fontWeight: '600',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  detailsButton: {
    margin: 0,
  },
  cancelButton: {
    margin: 0,
    borderColor: COLORS.error,
  },
  reorderButton: {
    margin: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  emptyButton: {
    borderRadius: 8,
  },
});
