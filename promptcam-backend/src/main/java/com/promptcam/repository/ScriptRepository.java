package com.promptcam.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.promptcam.entity.Script;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Repository
public class ScriptRepository {

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "scripts";

    public ScriptRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    public List<Script> findAll() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        List<Script> scripts = new ArrayList<>();
        for (DocumentSnapshot document : documents) {
            Script script = document.toObject(Script.class);
            if (script != null) {
                script.setId(document.getId());
                scripts.add(script);
            }
        }
        return scripts;
    }

    public Script findById(String id) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();
        if (document.exists()) {
            Script script = document.toObject(Script.class);
            if (script != null) {
                script.setId(document.getId());
            }
            return script;
        }
        return null;
    }

    public Script save(Script script) throws ExecutionException, InterruptedException {
        if (script.getId() == null || script.getId().isEmpty()) {
            DocumentReference addedDocRef = firestore.collection(COLLECTION_NAME).document();
            script.setId(addedDocRef.getId());
            addedDocRef.set(script).get();
        } else {
            firestore.collection(COLLECTION_NAME).document(script.getId()).set(script).get();
        }
        return script;
    }

    public void delete(String id) throws ExecutionException, InterruptedException {
        firestore.collection(COLLECTION_NAME).document(id).delete().get();
    }
}
