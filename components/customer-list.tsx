"use client";

import { useState } from "react";
import {
  DollarSign,
  Eye,
  Mail,
  MoreVertical,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { EditCustomerDialog } from "./edit-customer-dialog";
import { DeleteCustomerDialog } from "./delete-customer-dialog";
import { SpecialPricesDialog } from "./special-prices-dialog";

interface CustomerListProps {
  customers: Doc<"customers">[];
  businessId: Id<"businesses">;
}

export function CustomerList({ customers, businessId }: CustomerListProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<
    Doc<"customers"> | null
  >(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSpecialPricesDialogOpen, setIsSpecialPricesDialogOpen] = useState(
    false,
  );

  const handleCustomerClick = (customer: Doc<"customers">) => {
    setSelectedCustomer(customer);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (customer: Doc<"customers">) => {
    setSelectedCustomer(customer);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (customer: Doc<"customers">) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  const handleSpecialPrices = (customer: Doc<"customers">) => {
    setSelectedCustomer(customer);
    setIsSpecialPricesDialogOpen(true);
  };

  if (customers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No customers yet. Add your first customer!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {customers.map((customer) => (
          <div
            key={customer._id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
            onClick={() => handleCustomerClick(customer)}
          >
            <div className="flex-1">
              <h3 className="font-semibold">{customer.name}</h3>
              <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                {customer.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {customer.phone}
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {customer.email}
                  </div>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCustomerClick(customer);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpecialPrices(customer);
                  }}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Special Prices
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(customer);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(customer);
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      {/* Customer Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedCustomer.name}</DialogTitle>
                <DialogDescription>Customer details</DialogDescription>
              </DialogHeader>
              <div className="mt-6 space-y-4">
                {selectedCustomer.phone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Phone
                    </p>
                    <p className="text-base">{selectedCustomer.phone}</p>
                  </div>
                )}
                {selectedCustomer.email && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Email
                    </p>
                    <p className="text-base">{selectedCustomer.email}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Created
                  </p>
                  <p className="text-base">
                    {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {selectedCustomer && (
        <EditCustomerDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          customer={selectedCustomer}
        />
      )}

      {/* Delete Dialog */}
      {selectedCustomer && (
        <DeleteCustomerDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          customer={selectedCustomer}
        />
      )}

      {/* Special Prices Dialog */}
      {selectedCustomer && (
        <SpecialPricesDialog
          open={isSpecialPricesDialogOpen}
          onOpenChange={setIsSpecialPricesDialogOpen}
          customerId={selectedCustomer._id}
          customerName={selectedCustomer.name}
          businessId={businessId}
        />
      )}
    </>
  );
}
