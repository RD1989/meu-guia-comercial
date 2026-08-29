-- Atualiza o trigger de novos usuários para suportar cadastro dual (consumidor/lojista)
-- Lê o campo account_type do user_metadata para decidir a role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_type TEXT;
  v_role TEXT;
BEGIN
  -- Cria o perfil do usuário
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email);

  -- Lê o tipo de conta escolhido no cadastro (default: lojista para retrocompatibilidade)
  v_account_type := COALESCE(NEW.raw_user_meta_data->>'account_type', 'lojista');

  -- Atribui a role baseada na escolha
  IF v_account_type = 'consumidor' THEN
    v_role := 'USER';
  ELSE
    v_role := 'LOJISTA';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role);

  RETURN NEW;
END;
$$;
