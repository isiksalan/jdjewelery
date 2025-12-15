/* --- ADMIN.JS - Fixed Version with Error Handling --- */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin page loading...');
    
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined') {
        console.error('Firebase is not loaded!');
        alert('Firebase is not loaded. Please check your internet connection and reload.');
        return;
    }

    // Initialize Firebase services with error checking
    let storage, db, auth;
    
    try {
        storage = firebase.storage();
        console.log('✓ Storage initialized');
    } catch (error) {
        console.error('Storage initialization failed:', error);
        alert('Storage initialization failed. Please check Firebase Storage is enabled.');
        return;
    }

    try {
        db = firebase.firestore();
        console.log('✓ Firestore initialized');
    } catch (error) {
        console.error('Firestore initialization failed:', error);
        alert('Firestore initialization failed. Please check Firestore is enabled.');
        return;
    }

    try {
        auth = firebase.auth();
        console.log('✓ Auth initialized');
    } catch (error) {
        console.error('Auth initialization failed:', error);
        alert('Auth initialization failed.');
        return;
    }

    // DOM Elements
    const newCollectionName = document.getElementById('newCollectionName');
    const itemName = document.getElementById('itemName');
    const itemImage = document.getElementById('itemImage');
    const addItemBtn = document.getElementById('addItemBtn');
    const draftItemsContainer = document.getElementById('draftItemsContainer');
    const draftItems = document.getElementById('draftItems');
    const createCollectionBtn = document.getElementById('createCollectionBtn');
    const collectionsContainer = document.getElementById('collectionsContainer');
    const logoutBtn = document.getElementById('logoutBtn');
    const userEmail = document.getElementById('userEmail');

    // Modal Elements
    const editModal = document.getElementById('editModal');
    const closeModal = document.querySelector('.close-modal');
    const editNameInput = document.getElementById('editNameInput');
    const editItemName = document.getElementById('editItemName');
    const editItemImage = document.getElementById('editItemImage');
    const addEditItemBtn = document.getElementById('addEditItemBtn');
    const editItemsList = document.getElementById('editItemsList');
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    const editCollectionName = document.getElementById('editCollectionName');

    // Check if all elements exist
    if (!addItemBtn) {
        console.error('Add Item button not found!');
        return;
    }

    console.log('All DOM elements loaded successfully');

    // State
    let draftItemsList = [];
    let currentEditCollection = null;
    let currentEditItems = [];

    // --- 1. AUTHENTICATION CHECK ---
    auth.onAuthStateChanged(user => {
        if (!user) {
            console.log('No user logged in, redirecting to login...');
            window.location.href = 'login.html';
        } else {
            console.log('User logged in:', user.email);
            userEmail.textContent = user.email;
            loadCollections();
        }
    });

    // --- 2. LOGOUT ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            console.log('Logging out...');
            auth.signOut().then(() => {
                window.location.href = 'index.html';
            });
        });
    }

    // --- 3. ADD ITEM TO DRAFT ---
    addItemBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Add Item button clicked');
        
        const name = itemName.value.trim();
        const file = itemImage.files[0];

        console.log('Item name:', name);
        console.log('File selected:', file ? file.name : 'No file');

        if (!name) {
            alert('Please enter an item name');
            return;
        }
        
        if (!file) {
            alert('Please select an image file');
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file (JPG, PNG, etc.)');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = function(e) {
            const itemId = Date.now().toString();
            draftItemsList.push({
                id: itemId,
                name: name,
                file: file,
                preview: e.target.result
            });
            
            console.log('Item added to draft:', name);
            renderDraftItems();
            itemName.value = '';
            itemImage.value = '';
            updateCreateButton();
        };
        
        reader.onerror = function(error) {
            console.error('Error reading file:', error);
            alert('Error reading file. Please try again.');
        };
        
        reader.readAsDataURL(file);
    });

    // --- 4. RENDER DRAFT ITEMS ---
    function renderDraftItems() {
        console.log('Rendering draft items:', draftItemsList.length);
        
        if (draftItemsList.length === 0) {
            draftItemsContainer.style.display = 'none';
            return;
        }

        draftItemsContainer.style.display = 'block';
        draftItems.innerHTML = draftItemsList.map(item => `
            <div class="draft-item">
                <button class="remove-draft" data-id="${item.id}">×</button>
                <img src="${item.preview}" alt="${item.name}">
                <div class="draft-item-name">${item.name}</div>
            </div>
        `).join('');

        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-draft').forEach(btn => {
            btn.addEventListener('click', function() {
                removeDraftItem(this.dataset.id);
            });
        });
    }

    // --- 5. REMOVE DRAFT ITEM ---
    function removeDraftItem(id) {
        console.log('Removing draft item:', id);
        draftItemsList = draftItemsList.filter(item => item.id !== id);
        renderDraftItems();
        updateCreateButton();
    }

    // Make removeDraftItem globally accessible for onclick handlers
    window.removeDraftItem = removeDraftItem;

    // --- 6. UPDATE CREATE BUTTON ---
    function updateCreateButton() {
        const hasName = newCollectionName.value.trim() !== '';
        const hasItems = draftItemsList.length > 0;
        createCollectionBtn.disabled = !(hasName && hasItems);
        console.log('Create button enabled:', !createCollectionBtn.disabled);
    }

    if (newCollectionName) {
        newCollectionName.addEventListener('input', updateCreateButton);
    }

    // --- 7. CREATE COLLECTION ---
    if (createCollectionBtn) {
        createCollectionBtn.addEventListener('click', async function() {
            const collectionName = newCollectionName.value.trim();
            
            console.log('Creating collection:', collectionName);
            console.log('Items to upload:', draftItemsList.length);

            if (!collectionName || draftItemsList.length === 0) {
                alert('Please enter collection name and add at least one item');
                return;
            }

            createCollectionBtn.disabled = true;
            createCollectionBtn.textContent = 'Creating collection...';

            try {
                // Upload images to Firebase Storage
                const uploadedItems = [];
                
                for (const item of draftItemsList) {
                    console.log('Uploading:', item.name);
                    const timestamp = Date.now();
                    const fileName = `${timestamp}_${item.file.name}`;
                    const storageRef = storage.ref(`jewelry/${fileName}`);
                    
                    // Upload file
                    const snapshot = await storageRef.put(item.file);
                    const downloadURL = await snapshot.ref.getDownloadURL();
                    
                    uploadedItems.push({
                        name: item.name,
                        image: downloadURL,
                        timestamp: timestamp
                    });
                    
                    console.log('Uploaded successfully:', item.name);
                }

                // Save collection to Firestore
                const collectionData = {
                    name: collectionName,
                    items: uploadedItems,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    order: Date.now()
                };

                console.log('Saving to Firestore...');
                await db.collection('collections').add(collectionData);

                // Reset form
                newCollectionName.value = '';
                draftItemsList = [];
                renderDraftItems();
                updateCreateButton();
                
                alert('Collection created successfully!');
                console.log('Collection created successfully');
                loadCollections();

            } catch (error) {
                console.error('Error creating collection:', error);
                alert('Error creating collection: ' + error.message);
            } finally {
                createCollectionBtn.textContent = 'Create Collection';
                createCollectionBtn.disabled = false;
            }
        });
    }

    // --- 8. LOAD COLLECTIONS ---
    async function loadCollections() {
        console.log('Loading collections...');
        collectionsContainer.innerHTML = '<div class="loading">Loading collections...</div>';

        try {
            const snapshot = await db.collection('collections')
                .orderBy('order', 'desc')
                .get();

            console.log('Collections loaded:', snapshot.size);

            if (snapshot.empty) {
                collectionsContainer.innerHTML = '<p style="text-align: center; color: #6c757d;">No collections yet. Create your first collection above!</p>';
                return;
            }

            let html = '';
            snapshot.forEach(doc => {
                const collection = doc.data();
                const items = collection.items || [];
                
                html += `
                    <div class="collection-card">
                        <div class="collection-header">
                            <div class="collection-title">${collection.name}</div>
                            <div class="collection-actions">
                                <button class="edit-btn" data-id="${doc.id}">Edit</button>
                                <button class="delete-btn" data-id="${doc.id}" data-name="${collection.name}">Delete</button>
                            </div>
                        </div>
                        <div class="collection-items">
                            ${items.map(item => `
                                <div class="collection-item-thumb">
                                    <img src="${item.image}" alt="${item.name}">
                                    <div class="item-name">${item.name}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            });

            collectionsContainer.innerHTML = html;

            // Add event listeners to buttons
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    editCollection(this.dataset.id);
                });
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    deleteCollection(this.dataset.id, this.dataset.name);
                });
            });

        } catch (error) {
            console.error('Error loading collections:', error);
            collectionsContainer.innerHTML = '<div class="error">Error loading collections: ' + error.message + '</div>';
        }
    }

    // --- 9. DELETE COLLECTION ---
    async function deleteCollection(id, name) {
        if (!confirm(`Yesim able, are you sure you want to delete the collection "${name}"? This action cannot be undone.`)) {
            return;
        }

        console.log('Deleting collection:', name);

        try {
            // Get collection data first to delete images
            const doc = await db.collection('collections').doc(id).get();
            const collection = doc.data();
            
            // Delete images from storage
            if (collection.items) {
                for (const item of collection.items) {
                    try {
                        // Extract file path from URL and delete
                        const fileRef = storage.refFromURL(item.image);
                        await fileRef.delete();
                        console.log('Deleted image:', item.name);
                    } catch (err) {
                        console.log('Error deleting image:', err);
                        // Continue even if image deletion fails
                    }
                }
            }

            // Delete collection from Firestore
            await db.collection('collections').doc(id).delete();
            
            alert('Collection deleted successfully!');
            loadCollections();

        } catch (error) {
            console.error('Error deleting collection:', error);
            alert('Error deleting collection: ' + error.message);
        }
    }

    // --- 10. EDIT COLLECTION ---
    async function editCollection(id) {
        currentEditCollection = id;
        console.log('Editing collection:', id);
        
        try {
            const doc = await db.collection('collections').doc(id).get();
            const collection = doc.data();
            
            editCollectionName.textContent = collection.name;
            editNameInput.value = collection.name;
            currentEditItems = collection.items || [];
            
            renderEditItems();
            editModal.classList.add('active');
            
        } catch (error) {
            console.error('Error loading collection:', error);
            alert('Error loading collection: ' + error.message);
        }
    }

    // --- 11. RENDER EDIT ITEMS ---
    function renderEditItems() {
        editItemsList.innerHTML = currentEditItems.map((item, index) => `
            <div class="edit-item">
                <button class="remove-item" data-index="${index}">×</button>
                <img src="${item.image}" alt="${item.name}">
                <div class="edit-item-name">${item.name}</div>
            </div>
        `).join('');

        // Add event listeners
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function() {
                removeEditItem(parseInt(this.dataset.index));
            });
        });
    }

    // --- 12. REMOVE ITEM FROM EDIT ---
    async function removeEditItem(index) {
        if (!confirm('Yesim able, are you sure you want to remove this item?')) {
            return;
        }

        const item = currentEditItems[index];
        
        try {
            // Delete image from storage
            const fileRef = storage.refFromURL(item.image);
            await fileRef.delete();
        } catch (err) {
            console.log('Error deleting image:', err);
            // Continue even if deletion fails
        }

        currentEditItems.splice(index, 1);
        renderEditItems();
    }

    // Additional modal and edit functions...
    // [Rest of the edit modal code remains the same]

    // Make functions globally accessible
    window.editCollection = editCollection;
    window.deleteCollection = deleteCollection;
    window.removeEditItem = removeEditItem;

    console.log('Admin page fully loaded and initialized');
});