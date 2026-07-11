import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { firestore } from '../config/firebase.js';
import type { ConsultationRequestInput, ContactInput, ProjectDiscoveryInput } from '../schemas/leadSchemas.js';

export const createContactMessage = async (input: ContactInput) => {
  const ref = firestore.collection('contactSubmissions').doc();
  await ref.set({ ...input, createdAt: FieldValue.serverTimestamp() });
  return { id: ref.id };
};

export const createConsultationRequest = async (input: ConsultationRequestInput) => {
  const ref = firestore.collection('consultationRequests').doc();
  await ref.set({ ...input, createdAt: FieldValue.serverTimestamp(), status: 'new' });
  return { id: ref.id };
};

export const getCompanyProfile = async (uid: string) => {
  const snapshot = await firestore.collection('companyProfiles').doc(uid).get();
  if (!snapshot.exists) return null;
  return { id: snapshot.id, ...snapshot.data() };
};

export const createProjectDiscovery = async (uid: string, input: ProjectDiscoveryInput) => {
  const ref = firestore.collection('projectDiscovery').doc();
  await ref.set({ ...input, uid, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), status: 'submitted' });
  return { id: ref.id };
};

const mapProjectDiscoveryDoc = (doc: FirebaseFirestore.QueryDocumentSnapshot) => ({ id: doc.id, ...serializeFirestoreData(doc.data()) });

export const getLatestProjectDiscoveryForUser = async (uid: string) => {
  const snapshot = await firestore.collection('projectDiscovery').where('uid', '==', uid).orderBy('createdAt', 'desc').limit(1).get();
  const [latest] = snapshot.docs;
  return latest ? mapProjectDiscoveryDoc(latest) : null;
};

export const listProjectDiscoveryForUser = async (uid: string) => {
  const snapshot = await firestore.collection('projectDiscovery').where('uid', '==', uid).orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(mapProjectDiscoveryDoc);
};

const serializeFirestoreData = (data: FirebaseFirestore.DocumentData) => Object.fromEntries(
  Object.entries(data).map(([key, value]) => [key, value instanceof Timestamp ? value.toDate().toISOString() : value]),
);
