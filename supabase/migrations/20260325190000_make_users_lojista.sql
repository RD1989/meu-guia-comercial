-- Atualiza o trigger de novos usuários para dar a permissão de LOJISTA por padrão
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email);
  -- Adiciona sempre como LOJISTA para poder criar negócios
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'LOJISTA');
  RETURN NEW;
END;
$$;

-- Atualiza todos os usuários existentes que caíram no buraco de serem apenas "USER" para "LOJISTA"
UPDATE public.user_roles SET role = 'LOJISTA' WHERE role = 'USER';
