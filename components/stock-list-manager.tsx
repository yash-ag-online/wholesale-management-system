"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Plus, Trash } from "lucide-react";
import { Doc, Id } from "@/convex/_generated/dataModel";

type Props = {
  businessId: Id<"businesses">;
  stocks: Doc<"stocks">[];
};

export function StockListManager({ businessId, stocks }: Props) {
  const createStock = useMutation(api.stock.createStock);
  const updateStock = useMutation(api.stock.updateStock);
  const deleteStock = useMutation(api.stock.deleteStock);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<Id<"stocks"> | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    regularPrice: "",
    quantityAvailable: "",
    image: "",
  });

  // 🔥 Handle image upload (simple base64 preview for now)
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        image: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      regularPrice: "",
      quantityAvailable: "",
      image: "",
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleSubmit = async () => {
    if (!formData.name) return;

    if (editingId) {
      await updateStock({
        stockId: editingId,
        name: formData.name,
        regularPrice: Number(formData.regularPrice),
        quantityAvailable: Number(formData.quantityAvailable),
        image: formData.image,
      });
    } else {
      await createStock({
        businessId,
        name: formData.name,
        regularPrice: Number(formData.regularPrice),
        quantityAvailable: Number(formData.quantityAvailable),
        image: formData.image,
      });
    }

    resetForm();
  };

  return (
    <div className="mt-6 space-y-6">
      {/* 🔥 Add Button */}
      {!isAdding && !editingId && (
        <Button onClick={() => setIsAdding(true)}>
          <Plus /> Add Stock
        </Button>
      )}

      {/* 🔥 Add / Edit Form */}
      {(isAdding || editingId) && (
        <div className="border rounded-lg p-4 space-y-3">
          <p className="font-medium">
            {editingId ? "Edit Stock" : "Add New Stock"}
          </p>

          <Input
            placeholder="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Input
            type="number"
            placeholder="Price"
            value={formData.regularPrice}
            onChange={(e) =>
              setFormData({ ...formData, regularPrice: e.target.value })}
          />

          <Input
            type="number"
            placeholder="Quantity"
            value={formData.quantityAvailable}
            onChange={(e) =>
              setFormData({
                ...formData,
                quantityAvailable: e.target.value,
              })}
          />

          {/* 🔥 Image Upload */}
          <Input
            type="file"
            accept="image/*"
            onChange={(e) =>
              e.target.files && handleImageUpload(e.target.files[0])}
          />

          {formData.image && (
            <img
              src={formData.image}
              alt="Preview"
              className="h-20 rounded-md"
            />
          )}

          <div className="flex gap-2">
            <Button onClick={handleSubmit}>
              {editingId ? "Update" : "Add"}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* 🔥 Stock List */}
      <div className="space-y-4">
        {stocks.map((item) => (
          <div
            key={item._id}
            className="border rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-16 w-16 object-cover rounded-md"
                />
              )}
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  ₹{item.regularPrice} | Qty: {item.quantityAvailable}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingId(item._id);
                  setIsAdding(false);
                  setFormData({
                    name: item.name,
                    regularPrice: String(item.regularPrice),
                    quantityAvailable: String(item.quantityAvailable),
                    image: item.image || "",
                  });
                }}
              >
                <Edit size={16} />
              </Button>

              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteStock({ stockId: item._id })}
              >
                <Trash size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
