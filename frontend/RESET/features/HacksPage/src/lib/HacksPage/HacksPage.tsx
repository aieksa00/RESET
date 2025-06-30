import styles from './HacksPage.module.css';

import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';

import { HackDto, GraphQueryUrl, GraphQueryAPIKey, HacksQuery } from 'models';
import { HackCard } from '../HackCard/HackCard';

export function HacksPage() {
  const { data, status, refetch } = useQuery({
    queryKey: ['incidentEvents'],
    async queryFn(): Promise<{ incidentEvents: HackDto[] }> {
      return await request(GraphQueryUrl, HacksQuery, {}, { Authorization: `Bearer ${GraphQueryAPIKey}` });
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: 1000,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      searchTerm: '',
    },
  });

  const onSubmit = (searchData: { searchTerm: string }) => {
    const term = searchData.searchTerm.toLowerCase();
  };

  const renderHacksList = () => {
    if (status === 'pending') {
      return (
        <div className={styles['loading-container']}>
          <div className={styles['spinner']}></div>
          <h3>Loading hacks...</h3>
        </div>
      );
    }

    if (status === 'error') {
      return (
        <div className={styles['error-container']}>
          <h3>Error loading hacks...</h3>
        </div>
      );
    }

    if (!data.incidentEvents.length && status === 'success') {
      return (
        <div className={styles['no-hacks-container']}>
          <div className={styles['no-hacks']}>
            <h3>No hacks found</h3>
          </div>
          <button className={styles['refresh-button']} onClick={() => refetch()} aria-label="Refresh hacks">
            ↻
          </button>
        </div>
      );
    }

    return (
      <div className={styles['hack-list']}>
        {data.incidentEvents.map((hack, index) => (
          <HackCard key={index} hack={hack} />
        ))}
      </div>
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className={styles['form']}>
        <div className={`${styles['input-container']} ${errors.searchTerm ? styles['error-border'] : ''}`}>
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
          {errors.searchTerm && <p className={styles['error-message']}>{errors.searchTerm.message}</p>}
        </div>
        <button type="submit" className={styles['search-button']}>
          Search
        </button>
      </form>
      {renderHacksList()}
    </>
  );
}

export default HacksPage;
