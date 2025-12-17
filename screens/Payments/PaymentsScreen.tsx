import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import {
  subscribeToPayments,
  updatePaymentStatus,
  type Payment,
  type PaymentStatus,
} from "../../services/payments";

// Compatibilidade com theme
const theme = {
  colors: {
    background: Colors.light.background,
    text: Colors.light.text,
    textSecondary: Colors.light.secondaryText,
    primary: Colors.light.tint,
    surface: Colors.light.card,
    border: Colors.light.border,
  },
};

export default function PaymentsScreen() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedTab, setSelectedTab] = useState<
    "all" | "pending" | "paid" | "overdue"
  >("all");
  const [loading, setLoading] = useState(true);
  const [userRole] = useState<"student" | "trainer" | "owner">("student");

  useEffect(() => {
    if (!user?.uid || !userRole) return;

    const unsubscribe = subscribeToPayments(
      user.uid,
      userRole,
      (paymentsList) => {
        setPayments(paymentsList);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, userRole]);

  const filteredPayments = payments.filter((payment) => {
    if (selectedTab === "all") return true;
    return payment.status === selectedTab;
  });

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return "#4CAF50";
      case "pending":
        return "#FF9800";
      case "overdue":
        return "#F44336";
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusText = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return "Pago";
      case "pending":
        return "Pendente";
      case "overdue":
        return "Atrasado";
      default:
        return status;
    }
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    Alert.alert(
      "Confirmar Pagamento",
      "Deseja marcar este pagamento como pago?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              await updatePaymentStatus(paymentId, "paid", new Date());
              Alert.alert("Sucesso", "Pagamento atualizado com sucesso!");
            } catch {
              Alert.alert("Erro", "Não foi possível atualizar o pagamento.");
            }
          },
        },
      ]
    );
  };

  const renderPaymentItem = ({ item }: { item: Payment }) => {
    const dueDate = item.dueDate.toDate();
    const isOverdue = item.status === "overdue";
    const canMarkAsPaid = userRole === "trainer" || userRole === "owner";

    return (
      <View style={styles.paymentCard}>
        <View style={styles.paymentHeader}>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentDescription}>{item.description}</Text>
            <Text style={styles.paymentDate}>
              Vencimento: {dueDate.toLocaleDateString("pt-BR")}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        <View style={styles.paymentBody}>
          <View style={styles.paymentAmount}>
            <Text style={styles.amountLabel}>Valor:</Text>
            <Text style={styles.amountValue}>
              R$ {item.amount.toFixed(2).replace(".", ",")}
            </Text>
          </View>

          {item.paidDate && (
            <Text style={styles.paidDate}>
              Pago em: {item.paidDate.toDate().toLocaleDateString("pt-BR")}
            </Text>
          )}
        </View>

        {canMarkAsPaid && item.status !== "paid" && (
          <TouchableOpacity
            style={styles.markPaidButton}
            onPress={() => handleMarkAsPaid(item.id)}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.markPaidText}>Marcar como Pago</Text>
          </TouchableOpacity>
        )}

        {isOverdue && (
          <View style={styles.overdueWarning}>
            <Ionicons name="warning-outline" size={16} color="#F44336" />
            <Text style={styles.overdueText}>Pagamento em atraso</Text>
          </View>
        )}
      </View>
    );
  };

  const renderTabButton = (
    tab: "all" | "pending" | "paid" | "overdue",
    label: string,
    count: number
  ) => (
    <TouchableOpacity
      style={[styles.tabButton, selectedTab === tab && styles.activeTabButton]}
      onPress={() => setSelectedTab(tab)}
    >
      <Text
        style={[styles.tabLabel, selectedTab === tab && styles.activeTabLabel]}
      >
        {label}
      </Text>
      {count > 0 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const pendingCount = payments.filter((p) => p.status === "pending").length;
  const paidCount = payments.filter((p) => p.status === "paid").length;
  const overdueCount = payments.filter((p) => p.status === "overdue").length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando pagamentos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pagamentos</Text>
      </View>

      <View style={styles.tabs}>
        {renderTabButton("all", "Todos", payments.length)}
        {renderTabButton("pending", "Pendentes", pendingCount)}
        {renderTabButton("paid", "Pagos", paidCount)}
        {renderTabButton("overdue", "Atrasados", overdueCount)}
      </View>

      <FlatList
        data={filteredPayments}
        renderItem={renderPaymentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="receipt-outline"
              size={64}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.emptyText}>Nenhum pagamento encontrado</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  tabs: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
  },
  activeTabButton: {
    backgroundColor: theme.colors.primary,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  activeTabLabel: {
    color: "#fff",
  },
  countBadge: {
    marginLeft: 6,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  countText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#fff",
  },
  listContent: {
    padding: 15,
    flexGrow: 1,
  },
  paymentCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentDescription: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  paymentBody: {
    marginBottom: 12,
  },
  paymentAmount: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginRight: 8,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  paidDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: "italic",
  },
  markPaidButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  markPaidText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  overdueWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  overdueText: {
    color: "#F44336",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
