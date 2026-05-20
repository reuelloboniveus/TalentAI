import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Initialize Firebase Admin with Application Default Credentials
# or the default project
app = firebase_admin.initialize_app()
db = firestore.client()

# Update the document
doc_ref = db.collection('users').document('Dci5hdoKgLbzKBL08dNhX7SIQ9L2')
doc_ref.update({'role': 'super_admin'})
print("Role updated successfully to super_admin")
