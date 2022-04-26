import { useMutation, useQuery, useQueryClient } from "react-query";
import Dialog from "../utils/Dialog";
import produce from "immer";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { CustomerService } from "../../services/customerService";
import CreateCustomerForm, {
  createCustomerFormSchema,
  ICreateCustomerFormInputs,
} from "../forms/CreateCustomerForm";
import { ICustomer } from "../../@types/ICustomer";
import CustomersTable from "../data_display/CustomersTable";

/**
 * Customer page component
 * @returns
 */
export default function Customer() {
  const customerService = new CustomerService();
  const queryClient = useQueryClient();
  const addCustomerFormMethods = useForm<ICreateCustomerFormInputs>({
    resolver: zodResolver(createCustomerFormSchema),
  });

  const customersQuery = useQuery(
    ["get-customers"],
    customerService.getCustomers
  );

  const createCustomer = useMutation<
    unknown,
    unknown,
    ICreateCustomerFormInputs,
    void
  >((data) => customerService.createCustomer(data), {
    onMutate: async (data) => {
      await queryClient.cancelQueries(["get-customers"]);
      const customers = queryClient.getQueryData<ICustomer[]>([
        "get-customers",
      ]);
      const optimisticCustomers = produce(customers, (draft) => {
        const newCustomerItem: ICustomer = {
          id: 999,
          ...data,
        };
        draft?.push(newCustomerItem);
      });

      if (typeof optimisticCustomers === "undefined") {
        return;
      }

      queryClient.setQueryData<ICustomer[]>(
        ["get-customers"],
        optimisticCustomers
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries(["get-customers"]);
    },
  });

  if (customersQuery.isLoading) {
    return <div>Cargando...</div>;
  }

  if (customersQuery.isError) {
    return <div>Ocurrió un error</div>;
  }

  if (typeof customersQuery.data === "undefined") {
    return null;
  }

  return (
    <div>
      <FormProvider {...addCustomerFormMethods}>
        <Dialog<ICreateCustomerFormInputs>
          clickableButtonText="Nuevo cliente"
          titleText="Nuevo cliente"
          messageText="Crea un nuevo cliente"
          formSubmit={(data) => createCustomer.mutate(data)}
        >
          <CreateCustomerForm />
        </Dialog>
      </FormProvider>
      <CustomersTable customersData={customersQuery.data} />
    </div>
  );
}
