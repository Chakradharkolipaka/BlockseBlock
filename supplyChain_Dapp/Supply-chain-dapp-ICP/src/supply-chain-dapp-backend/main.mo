import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";

actor SupplyChain {
    public type Status = { #Available; #Canceled; #Returned; };

    public type Product = {
        id: Nat;
        name: Text;
        price: Nat; 
        owner: Principal;
        timestamp: Int;
        status: Status;
    };

    public type ProductDisplay = {
        id: Nat;
        name: Text;
        price: Nat;
        owner: Text;
        timestamp: Int;
        status: Nat;
    };

    private stable var productEntries : [(Nat, Product)] = [];
    private var products = HashMap.HashMap<Nat, Product>(0, Nat.equal, Nat32.fromNat);
    private stable var nextProductId : Nat = 1;

    system func preupgrade() {
        productEntries := Iter.toArray(products.entries());
    };

    system func postupgrade() {
        products := HashMap.fromIter<Nat, Product>(productEntries.vals(), 1, Nat.equal, Nat32.fromNat);
        productEntries := [];
    };

    public shared(msg) func addProduct(name : Text, price : Nat) : async Nat {
        let caller = msg.caller;
        
        let product : Product = {
            id = nextProductId;
            name = name;
            price = price;
            owner = caller;
            timestamp = Time.now();
            status = #Available;
        };

        products.put(nextProductId, product);
        let productId = nextProductId;
        nextProductId += 1;
        
        return productId;
    };

    public shared(msg) func updateProductStatus(productId : Nat, status : Nat) : async Bool {
        let caller = msg.caller;
        
        switch (products.get(productId)) {
            case (null) {
                return false; // Product not found
            };
            case (?product) {
                if (Principal.notEqual(product.owner, caller)) {
                    return false; // Only owner can update status
                };
                
                let newStatus : Status = switch (status) {
                    case (0) { #Available };
                    case (1) { #Canceled };
                    case (2) { #Returned };
                    case (_) { #Available }; // Default
                };
                
                let updatedProduct : Product = {
                    id = product.id;
                    name = product.name;
                    price = product.price;
                    owner = product.owner;
                    timestamp = product.timestamp;
                    status = newStatus;
                };
                
                products.put(productId, updatedProduct);
                return true;
            };
        };
    };

    public query func getProduct(productId : Nat) : async ?ProductDisplay {
        switch (products.get(productId)) {
            case (null) {
                return null; // Product not found
            };
            case (?product) {
                let statusCode = switch (product.status) {
                    case (#Available) { 0 };
                    case (#Canceled) { 1 };
                    case (#Returned) { 2 };
                };
                
                return ?{
                    id = product.id;
                    name = product.name;
                    price = product.price;
                    owner = Principal.toText(product.owner);
                    timestamp = product.timestamp;
                    status = statusCode;
                };
            };
        };
    };

    public query func getAllProducts() : async [ProductDisplay] {
        let productArray = Iter.toArray(products.vals());
        return Array.map<Product, ProductDisplay>(
            productArray,
            func (p : Product) : ProductDisplay {
                {
                    id = p.id;
                    name = p.name;
                    price = p.price;
                    owner = Principal.toText(p.owner);
                    timestamp = p.timestamp;
                    status = switch (p.status) { 
                        case (#Available) { 0 };
                        case (#Canceled) { 1 };
                        case (#Returned) { 2 };
                    }
                }
            }
        );
    };

    public query func productCount() : async Nat {
        return nextProductId - 1;
    };
}
