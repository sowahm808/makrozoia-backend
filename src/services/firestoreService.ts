import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { firestore } from '../config/firebase.js';
import type { ConsultationRequestInput, ContactInput, PocStatusUpdateInput, ProjectDiscoveryInput } from '../schemas/leadSchemas.js';

export const pocStatuses = ['submitted', 'accepted', 'in_progress', 'deployed', 'delivered'] as const;
export type PocStatus = typeof pocStatuses[number];

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
  return { id: snapshot.id, ...serializeFirestoreData(snapshot.data() ?? {}) };
};

export const createProjectDiscovery = async (uid: string, input: ProjectDiscoveryInput) => {
  const ref = firestore.collection('projectDiscovery').doc();
  await ref.set({
    ...input,
    uid,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    pocStatus: 'submitted',
    status: 'submitted',
  });
  return { id: ref.id };
};

const serializeFirestoreData = (data: FirebaseFirestore.DocumentData) => Object.fromEntries(
  Object.entries(data).map(([key, value]) => [key, value instanceof Timestamp ? value.toDate().toISOString() : value]),
);

const mapProjectDiscoveryDoc = (doc: FirebaseFirestore.QueryDocumentSnapshot): FirebaseFirestore.DocumentData & { id: string } => ({ id: doc.id, ...serializeFirestoreData(doc.data()) });

export const getLatestProjectDiscoveryForUser = async (uid: string) => {
  const snapshot = await firestore.collection('projectDiscovery').where('uid', '==', uid).orderBy('createdAt', 'desc').limit(1).get();
  const [latest] = snapshot.docs;
  return latest ? mapProjectDiscoveryDoc(latest) : null;
};

export const listProjectDiscoveryForUser = async (uid: string) => {
  const snapshot = await firestore.collection('projectDiscovery').where('uid', '==', uid).orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(mapProjectDiscoveryDoc);
};

export const listAdminClients = async () => {
  const snapshot = await firestore.collection('projectDiscovery').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map((doc) => {
    const data = serializeFirestoreData(doc.data());
    return {
      id: doc.id,
      uid: data.uid,
      companyName: data.companyName,
      businessProblem: data.businessProblem,
      desiredOutcome: data.desiredOutcome,
      servicesNeeded: data.servicesNeeded ?? [],
      budgetRange: data.budgetRange,
      timeline: data.timeline,
      currentTechStack: data.currentTechStack ?? [],
      cloudProvider: data.cloudProvider,
      complianceRequirements: data.complianceRequirements,
      pocStatus: data.pocStatus ?? data.status ?? 'submitted',
      status: data.status ?? data.pocStatus ?? 'submitted',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      pocStatusUpdatedAt: data.pocStatusUpdatedAt,
      pocStatusNote: data.pocStatusNote,
    };
  });
};

export const updateProjectDiscoveryPocStatus = async (submissionId: string, input: PocStatusUpdateInput, updatedByUid: string) => {
  const ref = firestore.collection('projectDiscovery').doc(submissionId);
  const snapshot = await ref.get();
  if (!snapshot.exists) return null;

  await ref.update({
    pocStatus: input.pocStatus,
    status: input.pocStatus,
    pocStatusNote: input.note ?? FieldValue.delete(),
    pocStatusUpdatedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    updatedByUid,
  });

  const updated = await ref.get();
  return { id: updated.id, ...serializeFirestoreData(updated.data() ?? {}) };
};
