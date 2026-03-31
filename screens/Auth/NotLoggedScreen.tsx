// COMPONENTES
import { ThemedButton } from "@/components/ThemedButton";

// CONSTANTES
import { Colors } from "@/constants/theme";

// CONTEXTOS E HOOKS
import { useColorScheme } from "@/hooks/use-color-scheme";

// BIBLIOTECAS EXTERNAS
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// REACT
import React from "react";

// REACT NATIVE
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
  },
  heroIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 42,
  },
  heroSubtitle: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 26,
    opacity: 0.8,
  },
  benefitsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  benefitCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  benefitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  ctaSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  roleCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  roleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  roleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  roleHeaderText: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  roleSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  roleFeatures: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.2,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.6,
  },
  studentSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  studentCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
  },
  studentTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 8,
  },
  studentDescription: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
    opacity: 0.7,
  },
  footerSection: {
    paddingHorizontal: 24,
    alignItems: "center",
  },
  signInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    width: "100%",
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default function NotLoggedScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";

  const benefits = [
    {
      icon: "calendar",
      title: "Gestão de Agenda",
      description: "Organize treinos, horários e turmas em um só lugar",
      color: "#4CAF50",
    },
    {
      icon: "people",
      title: "Conexão Profissional",
      description:
        "Conecte donos de academias com personal trainers qualificados",
      color: "#2196F3",
    },
    {
      icon: "stats-chart",
      title: "Acompanhamento de Resultados",
      description: "Monitore o progresso dos alunos e otimize treinos",
      color: "#FF9800",
    },
    {
      icon: "notifications",
      title: "Comunicação Eficiente",
      description: "Envie avisos e mantenha todos informados em tempo real",
      color: "#9C27B0",
    },
  ];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View
            style={[
              styles.heroIconContainer,
              { backgroundColor: Colors[colorScheme].card },
            ]}
          >
            <Ionicons
              name="barbell"
              size={50}
              color={Colors[colorScheme].tint}
            />
          </View>
          <Text style={[styles.heroTitle, { color: Colors[colorScheme].text }]}>
            Transforme sua{"\n"}Academia Digital
          </Text>
          <Text
            style={[
              styles.heroSubtitle,
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            A plataforma completa para gestão de academias, personal trainers e
            alunos
          </Text>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text
            style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}
          >
            Por que usar nosso app?
          </Text>
          {benefits.map((benefit, index) => (
            <View
              key={index}
              style={[
                styles.benefitCard,
                { backgroundColor: Colors[colorScheme].card },
              ]}
            >
              <View
                style={[
                  styles.benefitIconContainer,
                  { backgroundColor: benefit.color + "20" },
                ]}
              >
                <Ionicons
                  name={benefit.icon as any}
                  size={24}
                  color={benefit.color}
                />
              </View>
              <View style={styles.benefitTextContainer}>
                <Text
                  style={[
                    styles.benefitTitle,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  {benefit.title}
                </Text>
                <Text
                  style={[
                    styles.benefitDescription,
                    { color: Colors[colorScheme].secondaryText },
                  ]}
                >
                  {benefit.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text
            style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}
          >
            Escolha seu perfil
          </Text>

          {/* Owner Card */}
          <View
            style={[
              styles.roleCard,
              { backgroundColor: Colors[colorScheme].card },
            ]}
          >
            <View style={styles.roleHeader}>
              <View
                style={[
                  styles.roleIconContainer,
                  { backgroundColor: Colors[colorScheme].tint + "20" },
                ]}
              >
                <Ionicons
                  name="business"
                  size={28}
                  color={Colors[colorScheme].tint}
                />
              </View>
              <View style={styles.roleHeaderText}>
                <Text
                  style={[
                    styles.roleTitle,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  Dono de Academia
                </Text>
                <Text
                  style={[
                    styles.roleSubtitle,
                    { color: Colors[colorScheme].secondaryText },
                  ]}
                >
                  Gerencie seu negócio
                </Text>
              </View>
            </View>
            <View style={styles.roleFeatures}>
              <View style={styles.featureItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={Colors[colorScheme].tint}
                />
                <Text
                  style={[
                    styles.featureText,
                    { color: Colors[colorScheme].secondaryText },
                  ]}
                >
                  Cadastre e gerencie personal trainers
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={Colors[colorScheme].tint}
                />
                <Text
                  style={[
                    styles.featureText,
                    { color: Colors[colorScheme].secondaryText },
                  ]}
                >
                  Visualize estatísticas e relatórios
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={Colors[colorScheme].tint}
                />
                <Text
                  style={[
                    styles.featureText,
                    { color: Colors[colorScheme].secondaryText },
                  ]}
                >
                  Configure horários e infraestrutura
                </Text>
              </View>
            </View>
            <ThemedButton
              title="Criar Conta como Dono"
              onPress={() => router.push("/auth/signup-choose")}
            />
          </View>

          {/* Trainer Card */}
          <View
            style={[
              styles.roleCard,
              { backgroundColor: Colors[colorScheme].card },
            ]}
          >
            <View style={styles.roleHeader}>
              <View
                style={[
                  styles.roleIconContainer,
                  { backgroundColor: Colors[colorScheme].tint + "20" },
                ]}
              >
                <Ionicons
                  name="barbell"
                  size={28}
                  color={Colors[colorScheme].tint}
                />
              </View>
              <View style={styles.roleHeaderText}>
                <Text
                  style={[
                    styles.roleTitle,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  Personal Trainer
                </Text>
                <Text
                  style={[
                    styles.roleSubtitle,
                    { color: Colors[colorScheme].secondaryText },
                  ]}
                >
                  Treine e evolua seus alunos
                </Text>
              </View>
            </View>
            <View style={styles.roleFeatures}>
              <View style={styles.featureItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={Colors[colorScheme].tint}
                />
                <Text
                  style={[
                    styles.featureText,
                    { color: Colors[colorScheme].secondaryText },
                  ]}
                >
                  Gerencie turmas e horários
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={Colors[colorScheme].tint}
                />
                <Text
                  style={[
                    styles.featureText,
                    { color: Colors[colorScheme].secondaryText },
                  ]}
                >
                  Acompanhe progresso dos alunos
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={Colors[colorScheme].tint}
                />
                <Text
                  style={[
                    styles.featureText,
                    { color: Colors[colorScheme].secondaryText },
                  ]}
                >
                  Conecte-se com academias
                </Text>
              </View>
            </View>
            <ThemedButton
              title="Criar Conta como Personal"
              onPress={() => router.push("/auth/signup-choose")}
            />
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View
            style={[
              styles.dividerLine,
              { backgroundColor: Colors[colorScheme].border },
            ]}
          />
          <Text
            style={[
              styles.dividerText,
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            ou
          </Text>
          <View
            style={[
              styles.dividerLine,
              { backgroundColor: Colors[colorScheme].border },
            ]}
          />
        </View>

        {/* Student Section */}
        <View style={styles.studentSection}>
          <View
            style={[
              styles.studentCard,
              {
                borderColor: Colors[colorScheme].border,
                backgroundColor: Colors[colorScheme].background,
              },
            ]}
          >
            <Ionicons
              name="person"
              size={40}
              color={Colors[colorScheme].tint}
            />
            <Text
              style={[styles.studentTitle, { color: Colors[colorScheme].text }]}
            >
              Sou Aluno
            </Text>
            <Text
              style={[
                styles.studentDescription,
                { color: Colors[colorScheme].secondaryText },
              ]}
            >
              Recebeu um código de convite da sua academia?{"\n"}Cadastre-se
              como aluno agora!
            </Text>
            <ThemedButton
              title="Cadastrar como Aluno"
              variant="secondary"
              onPress={() => router.push("/auth/signup-student")}
              style={{ width: "100%" }}
            />
          </View>
        </View>

        {/* Footer - Sign In */}
        <View style={styles.footerSection}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/auth/signin")}
            style={[
              styles.signInButton,
              {
                borderColor: Colors[colorScheme].tint,
                backgroundColor: Colors[colorScheme].background,
              },
            ]}
          >
            <Ionicons
              name="log-in"
              size={22}
              color={Colors[colorScheme].tint}
            />
            <Text
              style={[
                styles.signInButtonText,
                { color: Colors[colorScheme].tint },
              ]}
            >
              Já tenho conta - Entrar
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
