from google.cloud import firestore

db = firestore.Client(project='prj-hrsaas-prod-firebase')
doc_ref = db.collection('users').document('Dci5hdoKgLbzKBL08dNhX7SIQ9L2')
doc_ref.update({'role': 'super_admin'})
print("Role updated successfully to super_admin")
