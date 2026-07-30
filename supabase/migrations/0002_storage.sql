-- Public storage bucket for recommendation photos, uploaded by staff via the admin dashboard.

insert into storage.buckets (id, name, public)
values ('recommendation-photos', 'recommendation-photos', true)
on conflict (id) do nothing;

create policy "public read recommendation photos"
  on storage.objects for select
  using (bucket_id = 'recommendation-photos');

create policy "authenticated upload recommendation photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'recommendation-photos');

create policy "authenticated update recommendation photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'recommendation-photos');

create policy "authenticated delete recommendation photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'recommendation-photos');
