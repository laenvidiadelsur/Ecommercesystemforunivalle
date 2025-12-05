import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Searchbar, List, Button } from 'react-native-paper';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '../../constants';

export default function HelpCenterScreen() {
  const [query, setQuery] = useState('');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Centro de Ayuda</Text>
      <Text style={styles.subtitle}>¿Cómo podemos ayudarte?</Text>

      <Searchbar
        placeholder="Buscar en ayuda..."
        value={query}
        onChangeText={setQuery}
        style={styles.search}
      />

      <Text style={styles.sectionTitle}>Contáctanos</Text>

      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text style={styles.cardTitle}>Chat en vivo</Text>
          <Text style={styles.cardDescription}>Chatea con nuestro equipo</Text>
          <Button mode="text" onPress={() => {}} style={styles.linkButton}>Iniciar chat</Button>
        </Card.Content>
      </Card>

      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text style={styles.cardTitle}>Email</Text>
          <Text style={styles.cardDescription}>soporte@unimarket.edu</Text>
          <Button mode="text" onPress={() => {}} style={styles.linkButton}>Enviar email</Button>
        </Card.Content>
      </Card>

      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text style={styles.cardTitle}>Teléfono</Text>
          <Text style={styles.cardDescription}>+591 700-00000</Text>
          <Button mode="text" onPress={() => {}} style={styles.linkButton}>Llamar</Button>
        </Card.Content>
      </Card>

      <Text style={styles.sectionTitle}>Preguntas Frecuentes</Text>

      <List.Section>
        <List.Accordion title="¿Cómo comprar?" titleStyle={styles.accordionTitle} style={styles.accordion}>
          <Text style={styles.faqText}>Explora el catálogo, agrega productos al carrito y procede al checkout.</Text>
        </List.Accordion>
        <List.Accordion title="¿Cómo vender?" titleStyle={styles.accordionTitle} style={styles.accordion}>
          <Text style={styles.faqText}>Cambia tu rol a vendedor en perfil y crea productos desde tu panel.</Text>
        </List.Accordion>
        <List.Accordion title="Problemas con el pago" titleStyle={styles.accordionTitle} style={styles.accordion}>
          <Text style={styles.faqText}>Verifica método de pago. Si persiste, contáctanos con el número de orden.</Text>
        </List.Accordion>
      </List.Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md },
  title: { fontSize: TYPOGRAPHY.fontSize.xxl, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  subtitle: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textSecondary, marginBottom: SPACING.md },
  search: { marginBottom: SPACING.lg, backgroundColor: COLORS.backgroundLight, borderRadius: LAYOUT.buttonBorderRadius, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.textPrimary, marginBottom: SPACING.sm, marginTop: SPACING.md },
  card: { marginBottom: SPACING.md, borderRadius: 12 },
  cardTitle: { fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.semibold, color: COLORS.textPrimary },
  cardDescription: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textSecondary, marginTop: SPACING.xs },
  linkButton: { alignSelf: 'flex-start', marginTop: SPACING.xs },
  accordion: { backgroundColor: COLORS.surface, borderRadius: 8, marginBottom: SPACING.sm },
  accordionTitle: { color: COLORS.textPrimary, fontWeight: '600' },
  faqText: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.md, color: COLORS.textSecondary },
});
