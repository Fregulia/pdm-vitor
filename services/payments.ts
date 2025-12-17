import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export type PaymentStatus = "paid" | "pending" | "overdue";

export interface Payment {
  id: string;
  studentId: string;
  trainerId: string;
  academyId: string;
  amount: number;
  status: PaymentStatus;
  dueDate: Timestamp;
  paidDate?: Timestamp;
  description: string;
  createdAt: Timestamp;
}

export interface Subscription {
  id: string;
  studentId: string;
  planId: string;
  amount: number;
  status: "active" | "cancelled" | "suspended";
  startDate: Timestamp;
  nextBillingDate: Timestamp;
  autoRenew: boolean;
}

/**
 * Create a payment record
 */
export async function createPayment(
  studentId: string,
  trainerId: string,
  academyId: string,
  amount: number,
  dueDate: Date,
  description: string
): Promise<string> {
  try {
    const paymentsRef = collection(db, "payments");
    const paymentData = {
      studentId,
      trainerId,
      academyId,
      amount,
      status: "pending" as PaymentStatus,
      dueDate: Timestamp.fromDate(dueDate),
      description,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(paymentsRef, paymentData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus,
  paidDate?: Date
): Promise<void> {
  try {
    const paymentRef = doc(db, "payments", paymentId);
    const updateData: any = { status };

    if (paidDate) {
      updateData.paidDate = Timestamp.fromDate(paidDate);
    }

    await updateDoc(paymentRef, updateData);
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error;
  }
}

/**
 * Get payments for a student
 */
export async function getStudentPayments(
  studentId: string
): Promise<Payment[]> {
  try {
    const paymentsRef = collection(db, "payments");
    const q = query(
      paymentsRef,
      where("studentId", "==", studentId),
      orderBy("dueDate", "desc")
    );

    const snapshot = await getDocs(q);
    const payments: Payment[] = [];

    snapshot.forEach((doc) => {
      payments.push({
        id: doc.id,
        ...doc.data(),
      } as Payment);
    });

    return payments;
  } catch (error) {
    console.error("Error getting student payments:", error);
    throw error;
  }
}

/**
 * Get payments for a trainer
 */
export async function getTrainerPayments(
  trainerId: string
): Promise<Payment[]> {
  try {
    const paymentsRef = collection(db, "payments");
    const q = query(
      paymentsRef,
      where("trainerId", "==", trainerId),
      orderBy("dueDate", "desc")
    );

    const snapshot = await getDocs(q);
    const payments: Payment[] = [];

    snapshot.forEach((doc) => {
      payments.push({
        id: doc.id,
        ...doc.data(),
      } as Payment);
    });

    return payments;
  } catch (error) {
    console.error("Error getting trainer payments:", error);
    throw error;
  }
}

/**
 * Get overdue payments for an academy
 */
export async function getOverduePayments(
  academyId: string
): Promise<Payment[]> {
  try {
    const paymentsRef = collection(db, "payments");
    const q = query(
      paymentsRef,
      where("academyId", "==", academyId),
      where("status", "==", "overdue")
    );

    const snapshot = await getDocs(q);
    const payments: Payment[] = [];

    snapshot.forEach((doc) => {
      payments.push({
        id: doc.id,
        ...doc.data(),
      } as Payment);
    });

    return payments;
  } catch (error) {
    console.error("Error getting overdue payments:", error);
    throw error;
  }
}

/**
 * Subscribe to payments for real-time updates
 */
export function subscribeToPayments(
  userId: string,
  userRole: "student" | "trainer" | "owner",
  callback: (payments: Payment[]) => void
): () => void {
  const paymentsRef = collection(db, "payments");
  let q;

  if (userRole === "student") {
    q = query(
      paymentsRef,
      where("studentId", "==", userId),
      orderBy("dueDate", "desc")
    );
  } else if (userRole === "trainer") {
    q = query(
      paymentsRef,
      where("trainerId", "==", userId),
      orderBy("dueDate", "desc")
    );
  } else {
    // For owner, get all payments for their academy
    // This would need academyId
    q = query(paymentsRef, orderBy("dueDate", "desc"));
  }

  return onSnapshot(q, (snapshot) => {
    const payments: Payment[] = [];
    snapshot.forEach((doc) => {
      payments.push({
        id: doc.id,
        ...doc.data(),
      } as Payment);
    });
    callback(payments);
  });
}

/**
 * Create a monthly subscription for a student
 */
export async function createSubscription(
  studentId: string,
  planId: string,
  amount: number
): Promise<string> {
  try {
    const subscriptionsRef = collection(db, "subscriptions");
    const subscriptionData = {
      studentId,
      planId,
      amount,
      status: "active",
      startDate: Timestamp.now(),
      nextBillingDate: Timestamp.fromDate(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      ),
      autoRenew: true,
    };

    const docRef = await addDoc(subscriptionsRef, subscriptionData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
}

/**
 * Check and update overdue payments
 * This should be called periodically (e.g., daily)
 */
export async function updateOverduePayments(): Promise<void> {
  try {
    const paymentsRef = collection(db, "payments");
    const q = query(paymentsRef, where("status", "==", "pending"));

    const snapshot = await getDocs(q);
    const now = Timestamp.now();

    const updates = snapshot.docs
      .filter((doc) => {
        const payment = doc.data();
        return payment.dueDate.toMillis() < now.toMillis();
      })
      .map((doc) => updateDoc(doc.ref, { status: "overdue" }));

    await Promise.all(updates);
  } catch (error) {
    console.error("Error updating overdue payments:", error);
    throw error;
  }
}
