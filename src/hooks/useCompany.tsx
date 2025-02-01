import StoreContext from '@/context/StoreContext';
import { useContext, useEffect } from 'react';

const useCompany = () => {
  const store = useContext(StoreContext);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const companyList = await store.company.listItems();
        console.log(companyList); 
        if (companyList.length > 0)
          store.company.setSelectedItem({ item: companyList[0], disableCache: true });
      } catch (err) {
        console.error(err);
      }
    };
    fetchCompany();
  }, []);
};

export default useCompany;
