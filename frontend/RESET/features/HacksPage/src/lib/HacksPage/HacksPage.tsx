import styles from './HacksPage.module.css';
import { HackDto, GraphQueryUrl, GraphQueryAPIKey } from 'models';
import { HackCard } from '../HackCard/HackCard';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useQuery } from '@tanstack/react-query';
import { gql, request } from 'graphql-request';

const query = gql`
  {
    incidentApproveds(first: 5) {
      id
      requestId
      incidentAddress
      protocolName
      hackedAmount
      hackerAddress
      txHash
      initialOfferAmount
      initialOfferValidity
      creator
    }
  }
`;

export function HacksPage() {
  const [hacks, setHacks] = useState<HackDto[]>([]);
  const [filteredHacks, setFilteredHacks] = useState<HackDto[]>([]);

  const { data, status } = useQuery({
    queryKey: ['data'],
    async queryFn(): Promise<{ incidentApproveds: HackDto[] }> {
      return await request(
        GraphQueryUrl,
        query,
        {},
        { Authorization: `Bearer ${GraphQueryAPIKey}` }
      );
    },
  });

  // Use useEffect to update hacks and filteredHacks when data is fetched
  useEffect(() => {
    if (status === 'success' && data) {
      setHacks(data.incidentApproveds || []);
      setFilteredHacks(data.incidentApproveds || []);
    }
  }, [data, status]);

  console.log('GraphQL Data:', data);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      searchTerm: '',
    },
  });

  const onSubmit = (data: { searchTerm: string }) => {
    const term = data.searchTerm.toLowerCase();
    const filtered = hacks.filter((hack) =>
      hack.protocolName.toLowerCase().includes(term)
    );
    setFilteredHacks(filtered);
    console.log(`Searching for: ${data.searchTerm}`);
  };

  return (
    <div className={styles['container']}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles['form']}>
        <div
          className={`${styles['input-container']} ${
            errors.searchTerm ? styles['error-border'] : ''
          }`}
        >
          <input
            type="text"
            id="searchTerm"
            placeholder="Search by protocol name..."
            {...register('searchTerm', {
              required: 'This field is required.',
              minLength: {
                value: 3,
                message: 'Search term must be at least 3 characters long.',
              },
            })}
            className={styles['search-bar']}
          />
          {errors.searchTerm && (
            <p className={styles['error-message']}>
              {errors.searchTerm.message}
            </p>
          )}
        </div>
        <button type="submit" className={styles['search-button']}>
          Search
        </button>
      </form>
      <div className={styles['hack-list']}>
        {filteredHacks.map((hack, index) => (
          <HackCard key={index} hack={hack} />
        ))}
      </div>
    </div>
  );
}

export default HacksPage;
