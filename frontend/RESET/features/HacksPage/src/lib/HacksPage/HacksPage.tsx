import styles from './HacksPage.module.css';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';

import { HackDto, GraphQueryUrl, GraphQueryAPIKey, HacksQuery } from 'models';
import { HackCard } from '../HackCard/HackCard';

export function HacksPage() {
  const [searchTerm, setSearchTerm] = useState('');

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
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      searchTerm: '',
    },
  });

  const onSubmit = (searchData: { searchTerm: string }) => {
    setSearchTerm(searchData.searchTerm.toLowerCase());
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

    const filteredHacks = searchTerm
      ? data?.incidentEvents.filter((hack) => hack.protocolName.toLowerCase().includes(searchTerm))
      : data?.incidentEvents || [];

    if (!filteredHacks.length && status === 'success') {
      return (
        <div className={styles['no-hacks-container']}>
          <div className={styles['no-hacks']}>
            <h3>No hacks found matching "{searchTerm}"</h3>
          </div>
          <button
            className={styles['refresh-button']}
            onClick={() => {
              setSearchTerm('');
              reset({ searchTerm: '' });
            }}
            aria-label="Clear search"
          >
            ↻
          </button>
        </div>
      );
    }

    return (
      <div className={styles['hack-list']}>
        {filteredHacks.map((hack, index) => (
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
        <div className={styles['actions']}>
          <button type="submit" className={styles['search-button']}>
            Search
          </button>
          <button
            type="reset"
            className={styles['search-button']}
            onClick={() => {
              setSearchTerm('');
              reset({ searchTerm: '' });
            }}
          >
            Clear
          </button>
        </div>
      </form>
      {renderHacksList()}
    </>
  );
}

export default HacksPage;
