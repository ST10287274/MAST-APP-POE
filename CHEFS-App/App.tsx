import { StatusBar } from 'expo-status-bar';
import React, {useState, useMemo, useCallback} from 'react';
import { StyleSheet, Text, View, Button, TextInput, Alert, TouchableOpacity, Modal, ScrollView, } from 'react-native';


interface MenuItem {
    id: string;
    name: string;
    description: string;
    category: string;
    price: string;
}

const menuCategories: string[] = ['All', 'Starters', 'Main Course', 'Desserts'];
const dishCategories: string[] = ['Starters', 'Main Course', 'Desserts'];

export default function App() {

    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Filter Menu Items based on selectedCategory
    const filteredItems = useMemo(() => {
        return menuItems.filter(item =>
            selectedCategory === 'All' || item.category === selectedCategory
        );
    }, [menuItems, selectedCategory]);

    // Handler to Save a New Dish is passed down
    const handleAddDish = useCallback((newDish: Omit<MenuItem, 'id'>) => {
        const itemWithId: MenuItem = {
            ...newDish,
            id: Date.now().toString(),
        };

        // Add new item to the menu
        setMenuItems(prevItems => [itemWithId, ...prevItems]);
        setIsModalVisible(false);
    }, []);

    const renderCategoryButton = (categoryName: string) => (
        <TouchableOpacity
            key={categoryName}
            onPress={() => setSelectedCategory(categoryName)}
            style={[
                styles.filterButton,
                selectedCategory === categoryName && styles.filterButtonActive,
            ]}
        >
            <Text
                style={[
                    styles.filterButtonText,
                    selectedCategory === categoryName && styles.filterButtonTextActive,
                ]}
            >
                {categoryName}
            </Text>
        </TouchableOpacity>
    );

    const renderDishItem = (item: MenuItem) => (
        <View key={item.id} style={styles.dishItem}>
            <View style={styles.dishHeader}>
                <Text style={styles.dishName}>{item.name}</Text>
                <Text style={styles.dishPrice}>R{item.price}</Text>
            </View>
            <Text style={styles.dishDescription}>{item.description || 'No description provided.'}</Text>
            <Text style={styles.dishCategory}>Category: {item.category}</Text>
        </View>
    );


    const DishModal = ({ onSave, onClose, isVisible }: { onSave: (dish: Omit<MenuItem, 'id'>) => void, onClose: () => void, isVisible: boolean }) => {

        const [newDishName, setNewDishName] = useState('');
        const [newDishDescription, setNewDishDescription] = useState('');
        const [newDishCategory, setNewDishCategory] = useState(dishCategories[0]);
        const [newDishPrice, setNewDishPrice] = useState('');

        React.useEffect(() => {
            if (isVisible) {
                setNewDishName('');
                setNewDishDescription('');
                setNewDishPrice('');
                setNewDishCategory(dishCategories[0]);
            }
        }, [isVisible]);

        const handleSave = () => {
            // Validation check
            if (!newDishName.trim() || !newDishPrice.trim() || isNaN(parseFloat(newDishPrice))) {
                Alert.alert("Validation Error", "Dish name and a valid price are required.");
                return;
            }

            const formattedPrice = parseFloat(newDishPrice).toFixed(2);

            const newDishData: Omit<MenuItem, 'id'> = {
                name: newDishName.trim(),
                description: newDishDescription.trim(),
                category: newDishCategory,
                price: formattedPrice,
            };

            onSave(newDishData);
        };
        
        const isSaveDisabled = !newDishName.trim() || !newDishPrice.trim() || isNaN(parseFloat(newDishPrice));

        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={isVisible} 
                onRequestClose={onClose} >

                <View style={styles.modalOverlay}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalHeader}>Add New Dish</Text>

                        
                        <Text style={styles.modalLabel}>Dish Name</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="e.g., Spicy Tuna Roll"
                            value={newDishName}
                            onChangeText={setNewDishName} 
                        />

                        
                        <Text style={styles.modalLabel}>Description</Text>
                        <TextInput
                            style={[styles.modalInput, styles.modalTextArea]}
                            placeholder="Briefly describe the dish"
                            value={newDishDescription}
                            onChangeText={setNewDishDescription} 
                            multiline={true}
                            numberOfLines={4}
                        />

                        
                        <Text style={styles.modalLabel}>Select Course</Text>
                        <View style={styles.modalPickerContainer}>
                            <TextInput
                                style={styles.modalInput}
                                value={newDishCategory}
                                placeholder="Select Category"
                                editable={false}
                            />
    
                            <View style={styles.pickerOptionsContainer}>
                                {dishCategories.map(c => (
                                    <TouchableOpacity
                                        key={c}
                                        onPress={() => setNewDishCategory(c)}
                                        style={c === newDishCategory ? styles.pickerOptionActive : null}
                                    >
                                        <Text style={styles.pickerOptionText}>{c}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>


                        
                        <Text style={styles.modalLabel}>Price</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="e.g., 12.99"
                            keyboardType="numeric"
                            value={newDishPrice}
                            onChangeText={setNewDishPrice} 
                        />

                        
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={onClose}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalSaveButton, isSaveDisabled && styles.modalSaveButtonDisabled]}
                                onPress={handleSave}
                                disabled={isSaveDisabled}
                            >
                                <Text style={styles.modalButtonText}>Save Dish</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <View style={styles.container}>
          
            <DishModal
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSave={handleAddDish}
            />

            <View style={styles.headerBar}>
                <Text style={styles.headerTitle}>Menu ({menuItems.length})</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setIsModalVisible(true)}
                >
                    <Text style={styles.addButtonText}>+ Add Dish</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.filterBar}>
                {menuCategories.map(renderCategoryButton)}
            </View>

            <View style={styles.contentArea}>
                <Text style={styles.contentText}>
                    Showing:
                    <Text style={{ fontWeight: 'bold', color: '#000000' }}> {selectedCategory}</Text>
                    {' '}
                    ({filteredItems.length} items)
                </Text>

                <ScrollView style={styles.dishListContainer}>
                    {filteredItems.length > 0 ? (
                        filteredItems.map(renderDishItem)
                    ) : (
                        <Text style={styles.emptyListText}>
                            No dishes found in the **{selectedCategory}** category.
                        </Text>
                    )}
                </ScrollView>
            </View>

            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingTop: 50, 
    },
    headerBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '95%',
        paddingHorizontal: 10,
        marginBottom: 20,
        marginTop: 10,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    addButton: {
        backgroundColor: '#000000',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
        elevation: 3,
    },
    addButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    filterBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '95%',
        paddingHorizontal: 10,
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
        gap: 8,
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#858282ff', 
        elevation: 2, 
    },
    filterButtonActive: {
        backgroundColor: '#000000ff', 
    },
    filterButtonText: {
        color: '#ffffffff', 
        fontSize: 14,
    },
    filterButtonTextActive: {
        color: '#ffffffff', 
        fontWeight: 'bold',
    },
    contentArea: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 20,
    },
    contentText: {
        fontSize: 18,
        color: '#4b4949ff',
        marginBottom: 10,
    },
    dishListContainer: {
        flex: 1,
    },
    dishItem: {
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    dishHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    dishName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    dishPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
    },
    dishDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    dishCategory: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
    },
    emptyListText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
        fontStyle: 'italic',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 35,
        alignItems: 'stretch',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
        maxWidth: 400,
    },
    modalHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    modalLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 10,
        marginBottom: 5,
        color: '#555',
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    modalTextArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    modalPickerContainer: {
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    modalPicker: {
        height: 40,
        width: '100%',
    },
    pickerOptionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        padding: 5,
        borderRadius: 5,
        backgroundColor: '#eee',
    },
    pickerOptionText: {
        fontSize: 14,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 3,
        color: '#333',
    },
    pickerOptionActive: {
        backgroundColor: '#ccc',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 25,
    },
    modalCancelButton: {
        backgroundColor: '#858282ff',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
    },
    modalSaveButton: {
        backgroundColor: '#000000ff',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        alignItems: 'center',
    },
    modalSaveButtonDisabled: {
        backgroundColor: '#333',
    },
    modalButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
