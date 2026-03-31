// COMPONENTES
import { BackButton } from "@/components/BackButton";

// CONSTANTES
import { Colors } from "@/constants/theme";

// CONTEXTOS E HOOKS
import { useColorScheme } from "@/hooks/use-color-scheme";

// BIBLIOTECAS EXTERNAS
import { Ionicons } from "@expo/vector-icons";

// REACT
import React from "react";

// REACT NATIVE
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function PropostaScreen() {
  const colorScheme = useColorScheme() ?? "light";

  const features = [
    {
      icon: "people-outline",
      title: "Gestão de Alunos",
      description: "Cadastre e organize todos os seus alunos em um só lugar",
    },
    {
      icon: "calendar-outline",
      title: "Controle de Horários",
      description: "Gerencie horários e agende treinos de forma eficiente",
    },
    {
      icon: "trending-up-outline",
      title: "Acompanhamento",
      description: "Registre progressos e evolução de cada aluno",
    },
    {
      icon: "chatbubbles-outline",
      title: "Comunicação",
      description: "Mantenha contato direto e organizado com seus alunos",
    },
  ];

  const benefits = [
    {
      icon: "body-outline",
      title: "Composição Corporal",
      description: "Melhore massa muscular e reduza gordura",
    },
    {
      icon: "fitness-outline",
      title: "Força & Resistência",
      description: "Fortaleça ossos, articulações e músculos",
    },
    {
      icon: "happy-outline",
      title: "Bem-estar Mental",
      description: "Reduza estresse e melhore a autoestima",
    },
    {
      icon: "medkit-outline",
      title: "Saúde Preventiva",
      description: "Previna doenças e melhore a postura",
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* BACK BUTTON */}
      <View style={styles.backButtonContainer}>
        <BackButton />
      </View>

      {/* HEADER COM ÍCONE */}
      <View
        style={[styles.header, { backgroundColor: Colors[colorScheme].tint }]}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="barbell" size={48} color="#FFF" />
        </View>
        <Text style={styles.headerTitle}>Muscle.io</Text>
        <Text style={styles.headerSubtitle}>
          Gestão profissional para personal trainers
        </Text>
      </View>

      {/* CARD DE PROPOSTA */}
      <View style={styles.content}>
        <View
          style={[
            styles.proposalCard,
            { backgroundColor: Colors[colorScheme].card },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons
              name="bulb-outline"
              size={28}
              color={Colors[colorScheme].tint}
            />
            <Text
              style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}
            >
              Nossa Proposta
            </Text>
          </View>
          <Text
            style={[
              styles.proposalText,
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            Uma plataforma completa pensada para personal trainers que desejam
            oferecer um acompanhamento profissional e personalizado aos seus
            alunos. Centralize todas as informações, gerencie treinos e
            potencialize os resultados.
          </Text>
        </View>

        {/* FUNCIONALIDADES */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionLabel,
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            FUNCIONALIDADES PRINCIPAIS
          </Text>

          <View style={styles.grid}>
            {features.map((feature, index) => (
              <View
                key={index}
                style={[
                  styles.featureCard,
                  { backgroundColor: Colors[colorScheme].card },
                ]}
              >
                <View
                  style={[
                    styles.featureIconContainer,
                    { backgroundColor: Colors[colorScheme].tint + "20" },
                  ]}
                >
                  <Ionicons
                    name={feature.icon as any}
                    size={24}
                    color={Colors[colorScheme].tint}
                  />
                </View>
                <Text
                  style={[
                    styles.featureTitle,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  {feature.title}
                </Text>
                <Text
                  style={[
                    styles.featureDescription,
                    { color: Colors[colorScheme].secondaryText },
                  ]}
                >
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* BENEFÍCIOS DA MUSCULAÇÃO */}
        <View style={styles.section}>
          <View
            style={[
              styles.benefitsHeader,
              { backgroundColor: Colors[colorScheme].card },
            ]}
          >
            <Ionicons
              name="trophy-outline"
              size={24}
              color={Colors[colorScheme].tint}
            />
            <Text
              style={[
                styles.sectionTitle,
                { color: Colors[colorScheme].text, marginBottom: 4 },
              ]}
            >
              Por que Musculação?
            </Text>
            <Text
              style={[
                styles.benefitsSubtitle,
                { color: Colors[colorScheme].secondaryText },
              ]}
            >
              Transforme sua saúde com treino de força
            </Text>
          </View>

          {benefits.map((benefit, index) => (
            <View
              key={index}
              style={[
                styles.benefitItem,
                { backgroundColor: Colors[colorScheme].card },
              ]}
            >
              <View
                style={[
                  styles.benefitIconContainer,
                  { backgroundColor: Colors[colorScheme].tint + "15" },
                ]}
              >
                <Ionicons
                  name={benefit.icon as any}
                  size={22}
                  color={Colors[colorScheme].tint}
                />
              </View>
              <View style={styles.benefitContent}>
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

        {/* POR QUE UM APP */}
        <View
          style={[
            styles.whyAppCard,
            { backgroundColor: Colors[colorScheme].tint },
          ]}
        >
          <View style={styles.whyAppHeader}>
            <Ionicons name="phone-portrait-outline" size={32} color="#FFF" />
            <Text style={styles.whyAppTitle}>Por que um App?</Text>
          </View>
          <View style={styles.whyAppContent}>
            <View style={styles.whyAppItem}>
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              <Text style={styles.whyAppText}>
                Acesso rápido a todas as informações
              </Text>
            </View>
            <View style={styles.whyAppItem}>
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              <Text style={styles.whyAppText}>
                Reduz erros e economiza tempo
              </Text>
            </View>
            <View style={styles.whyAppItem}>
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              <Text style={styles.whyAppText}>
                Melhora a experiência do aluno
              </Text>
            </View>
            <View style={styles.whyAppItem}>
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              <Text style={styles.whyAppText}>
                Profissionaliza seu atendimento
              </Text>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text
            style={[
              styles.footerText,
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            Desenvolvido com 💪 para personal trainers
          </Text>
          <Text
            style={[
              styles.footerCredit,
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            Criado por Vitor Fregulia
          </Text>
          <Text
            style={[
              styles.footerInstitution,
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            Trabalho de Conclusão de Curso
          </Text>
          <Text
            style={[
              styles.footerInstitution,
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            Tecnologia em Sistemas para Internet
          </Text>
          <Text
            style={[
              styles.footerInstitution,
              { color: Colors[colorScheme].secondaryText },
            ]}
          >
            IFSul Campus Pelotas
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backButtonContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 16,
    marginTop: -20,
  },
  proposalCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  proposalText: {
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  grid: {
    gap: 12,
  },
  featureCard: {
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  benefitsHeader: {
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  benefitsSubtitle: {
    fontSize: 14,
  },
  benefitItem: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  benefitIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  benefitContent: {
    flex: 1,
    justifyContent: "center",
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  benefitDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  whyAppCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  whyAppHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  whyAppTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 12,
  },
  whyAppContent: {
    gap: 12,
  },
  whyAppItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  whyAppText: {
    fontSize: 15,
    color: "#FFF",
    flex: 1,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    fontWeight: "600",
  },
  footerCredit: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 4,
  },
  footerInstitution: {
    fontSize: 12,
    textAlign: "center",
  },
});
